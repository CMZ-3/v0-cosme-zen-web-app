/**
 * FDA PDF Text Parser
 * Parses text content extracted from จ.ค.๑ and จ.ร.๑ PDF documents
 * and maps fields to the FdaFormData structure.
 */

import type { FdaIngredientRow } from "@/components/fda/create-jk-dialog"

// Generic parsed data for both JK and JR forms
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedFdaData = Record<string, any>

/**
 * Detect if text is จ.ร. (receipt) or จ.ค. (application)
 */
function detectType(text: string): "jk" | "jr" {
  if (/แบบ\s*จ\.?\s*ร\.?\s*[๑1]/i.test(text)) return "jr"
  if (/ใบรับจดแจ้งรับจ้างผลิต/i.test(text)) return "jr"
  if (/ใบรับจดแจ้ง/i.test(text) && !/คำขอจดแจ้ง/.test(text)) return "jr"
  return "jk"
}

/**
 * Extract a value after a label pattern
 */
function extractAfter(text: string, pattern: RegExp): string {
  const m = text.match(pattern)
  if (!m) return ""
  const afterIdx = (m.index || 0) + m[0].length
  // Take text until next newline or next label
  const rest = text.substring(afterIdx).split(/\n/)[0]
  return rest.replace(/^[\s:]+/, "").trim()
}

/**
 * Extract multiline value between two label patterns
 */
function extractBetween(text: string, start: RegExp, end: RegExp): string {
  const sMatch = text.match(start)
  if (!sMatch) return ""
  const sIdx = (sMatch.index || 0) + sMatch[0].length
  const rest = text.substring(sIdx)
  const eMatch = rest.match(end)
  const endIdx = eMatch ? eMatch.index || rest.length : rest.length
  return rest.substring(0, endIdx).replace(/^[\s:]+/, "").replace(/\n+/g, " ").trim()
}

/**
 * Parse ingredient table from จ.ค.๑ section ๑๐
 */
function parseIngredients(text: string): FdaIngredientRow[] {
  const results: FdaIngredientRow[] = []

  // Look for numbered rows with CAS + INCI patterns
  // Format: number CAS_NUMBER INCI_NAME
  // e.g.: 1 7732-18-5 AQUA
  // or:   4 LAURAMIDOPROPYL HYDROXYSULTAINE (no CAS)
  const lines = text.split("\n")
  let inIngredientSection = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect start of ingredient section
    if (/ส่วนผสมในเครื่องสำอาง|ส่วนผสมในเครื่องสําอาง|INCI.*Name/i.test(trimmed)) {
      inIngredientSection = true
      continue
    }

    // Detect end of ingredient section
    if (inIngredientSection && (/^รวม\s*:/.test(trimmed) || /รายละเอียดเพิ่มเติม/.test(trimmed))) {
      break
    }

    if (!inIngredientSection) continue

    // Try to match: NUMBER CAS_NUMBER INCI_NAME
    const matchWithCas = trimmed.match(/^(\d{1,3})\s*(\d[\d-]+\d)\s*(.+)$/i)
    if (matchWithCas) {
      results.push({
        no: parseInt(matchWithCas[1]),
        casNumber: matchWithCas[2].trim(),
        inciName: matchWithCas[3].trim(),
      })
      continue
    }

    // Try to match: NUMBER INCI_NAME (no CAS)
    const matchNoCas = trimmed.match(/^(\d{1,3})\s+([A-Z][A-Z0-9\s,()/-]+)$/i)
    if (matchNoCas && matchNoCas[2].trim().length > 2) {
      results.push({
        no: parseInt(matchNoCas[1]),
        casNumber: "",
        inciName: matchNoCas[2].trim(),
      })
      continue
    }
  }

  return results.length > 0 ? results : [{ no: 1, casNumber: "", inciName: "" }]
}

/**
 * Parse physical form from text
 */
function parsePhysicalForm(text: string): string {
  const patterns = [
    { re: /ของเหลว\s*\(?Liquid\)?/i, val: "ของเหลว (Liquid)" },
    { re: /ครีม\s*\(?Cream\)?/i, val: "ครีม (Cream)" },
    { re: /เจล\s*\(?Gel\)?/i, val: "เจล (Gel)" },
    { re: /ผง\s*\(?Powder\)?/i, val: "ผง (Powder)" },
    { re: /แท่ง\s*\(?Stick\)?/i, val: "แท่ง (Stick)" },
    { re: /สเปรย์\s*\(?Spray\)?/i, val: "สเปรย์ (Spray)" },
    { re: /โฟม\s*\(?Foam\)?/i, val: "โฟม (Foam)" },
  ]
  for (const p of patterns) {
    if (p.re.test(text)) return p.val
  }
  return ""
}

/**
 * Parse container type
 */
function parseContainerType(text: string): string {
  if (/ขวดพลาสติก|ขวดอะคริลิค/.test(text)) return "ขวดพลาสติก/ขวดอะคริลิค"
  if (/ขวดแก้ว/.test(text)) return "ขวดแก้ว"
  if (/หลอดพลาสติก/.test(text)) return "หลอดพลาสติก"
  if (/กระปุก/.test(text)) return "กระปุก"
  if (/ซอง/.test(text)) return "ซอง"
  return ""
}

/**
 * Main parser: takes raw PDF text and returns partial FdaFormData
 */
export function parseFdaPdfText(rawText: string): ParsedFdaData {
  const text = rawText.replace(/\r/g, "")
  const regType = detectType(text)

  const result: ParsedFdaData = { regType }

  // === จ.ร. (Receipt) parsing ===
  if (regType === "jr") {
    // Registration number
    const regNo = extractAfter(text, /เลขที่ใบรับจดแจ้ง\s*(?:เลขที่)?\s*[:：]?/i) ||
                  extractAfter(text, /ใบรับจดแจ้งเลขที่\s*[:：]?/i)

    // Product name Thai
    const productTh = extractAfter(text, /ชื่อการค้าและชื่อเครื่องสำอาง\s*\(ไทย\)\s*[:：]?/i) ||
                      extractAfter(text, /ชื่อการค้าและชื่อเครื่องสําอาง\s*\(ไทย\)\s*[:：]?/i)
    const productEn = extractAfter(text, /ชื่อการค้าและชื่อเครื่องสำอาง\s*\(อังกฤษ\)\s*[:：]?/i) ||
                      extractAfter(text, /ชื่อการค้าและชื่อเครื่องสําอาง\s*\(อังกฤษ\)\s*[:：]?/i)

    // Cosmetic type
    const cosmeticType = extractAfter(text, /ประเภทของเครื่องสำอาง\s*[:：]?/i) ||
                         extractAfter(text, /ประเภทของเครื่องสําอาง\s*[:：]?/i)

    // Physical form
    const physicalFormRaw = extractAfter(text, /ลักษณะทางกายภาพของเครื่องสำอาง(?:และภาชนะบรรจุ)?\s*[:：]?/i) ||
                            extractAfter(text, /ลักษณะทางกายภาพของเครื่องสําอาง(?:และภาชนะบรรจุ)?\s*[:：]?/i)

    // Product format
    const productFormat = extractAfter(text, /รูปแบบของเครื่องสำอาง\s*[:：]?/i) ||
                          extractAfter(text, /รูปแบบของเครื่องสําอาง\s*[:：]?/i)

    // Manufacturer
    const contractorName = extractAfter(text, /ชื่อผู้รับจ้างผลิต\s*[:：]?/i)
    const factoryAddr = extractBetween(text, /ที่ตั้งสถานที่ผลิต\s*[:：]?/i, /ที่ตั้งสถานที่เก็บ/i)
    const storageAddr = extractBetween(text, /ที่ตั้งสถานที่เก็บ\s*[:：]?/i, /ชื่อผู้ว่าจ้าง/i)
    const clientName = extractAfter(text, /ชื่อผู้ว่าจ้างผลิต\s*[:：]?/i)
    const clientAddr = extractBetween(text, /ที่ตั้งสถานที่ประกอบธุรกิจ\s*[:：]?/i, /เลขที่ใบรับจดแจ้งของเครื่องสำอาง/i) ||
                       extractBetween(text, /ที่ตั้งสถานที่ประกอบธุรกิจ\s*[:：]?/i, /เลขที่ใบรับจดแจ้งของเครื่องสําอาง/i)

    // Split product name: trade name vs cosmetic name
    // For จร, the full TH name is "ลา รีไฟน์ โคชิ อะมิโน มอยซ์เจอร์ ล็อค แชมพู"
    // But we can try to split based on the EN which may have brand + product
    const enParts = productEn.split(/\s+/)
    // Heuristic: if the EN has more than 2 words, first 2 might be brand
    // But safer to use the full name as product name
    result.productNameTh = productTh
    result.productNameEn = productEn

    result.physicalForm = parsePhysicalForm(physicalFormRaw || text)
    result.containerType = parseContainerType(physicalFormRaw || text)

    if (/ผลิตภัณฑ์เดี่ยว/.test(productFormat)) result.productFormat = "single"

    // Application area from cosmetic type
    if (/เส้นผม|หนังศีรษะ/.test(cosmeticType)) result.applicationArea = "เส้นผม/หนังศีรษะ"
    if (/ใบหน้า|face/i.test(cosmeticType)) result.applicationArea = "ใบหน้า"

    // Product purpose from cosmetic type
    if (/แชมพู/i.test(cosmeticType)) result.productPurpose = "แชมพู"
    if (/กันแดด/i.test(cosmeticType)) result.productPurpose = "กันแดด"
    if (/บำรุง/i.test(cosmeticType)) result.productPurpose = "บำรุงผิว"

    // Business type
    if (contractorName) {
      result.businessType = "contract_manufacture"
      result.cm_contractorName = contractorName
      result.cm_factoryAddress = factoryAddr
      result.cm_storageAddress = storageAddr
      result.cm_clientName = clientName
      result.cm_clientAddress = clientAddr
    }

    return result
  }

  // === จ.ค. (Application) parsing ===

  // ๑.๑ Trade name
  const section1 = extractBetween(text, /๑\.๑\s*ชื่อการค้า/i, /๑\.๒/i)
  if (section1) {
    // Try to split Thai + EN
    const thaiMatch = section1.match(/([ก-๙\s]+)/u)
    const enMatch = section1.match(/([A-Z][A-Z\s]+)/i)
    if (thaiMatch) result.tradeNameTh = thaiMatch[1].trim()
    if (enMatch) result.tradeNameEn = enMatch[1].trim()
  }

  // ๑.๒ Product name
  const section12 = extractBetween(text, /๑\.๒\s*ชื่อเครื่องสำอาง|๑\.๒\s*ชื่อเครื่องสําอาง/i, /๑\.๓/i)
  if (section12) {
    const thaiMatch = section12.match(/([\u0E00-\u0E7F\s]+)/u)
    const enMatch = section12.match(/([A-Z][A-Z0-9\s]+)/i)
    if (thaiMatch) result.productNameTh = thaiMatch[1].trim()
    if (enMatch) result.productNameEn = enMatch[1].trim()
  }

  // ๒. Usage format
  if (/ใช้แล้วล้างออก/.test(text)) result.usageFormat = "rinse_off"
  if (/ใช้แล้วไม่ต้องล้างออก/.test(text)) result.usageFormat = "leave_on"

  // ๓. Cosmetic type
  if (/เส้นผม|หนังศีรษะ/.test(text)) result.applicationArea = "เส้นผม/หนังศีรษะ"
  else if (/ใบหน้า/.test(text)) result.applicationArea = "ใบหน้า"
  else if (/ผิวหนัง|ร่างกาย/.test(text)) result.applicationArea = "ผิวหนัง/ร่างกาย"

  // ๓.๒ Purpose
  if (/แชมพู/.test(text)) result.productPurpose = "แชมพู"
  else if (/กันแดด/.test(text)) result.productPurpose = "กันแดด"
  else if (/บำรุงผิว/.test(text)) result.productPurpose = "บำรุงผิว"

  // ๔. Usage instructions
  const usage = extractBetween(text, /๔\.\s*วิธีใช้/i, /๕\./i)
  if (usage) result.usageInstructions = usage

  // ๕. Physical form
  result.physicalForm = parsePhysicalForm(text)

  // ๖. Container
  result.containerType = parseContainerType(text)

  // ๘. Product format
  if (/ผลิตภัณฑ์เดี่ยวชนิดเดียวกัน/.test(text)) result.productFormat = "single_color_scent"
  else if (/ผลิตภัณฑ์หลายรายการ/.test(text)) result.productFormat = "multi_combined"
  else if (/ผลิตภัณฑ์เดี่ยว/.test(text)) result.productFormat = "single"

  // ๙. Business
  const contractorName = extractAfter(text, /ชื่อผู้รับจ้างผลิต\s*/i)
  if (contractorName) {
    result.businessType = "contract_manufacture"
    result.cm_contractorName = contractorName

    const factoryAddr = extractBetween(text, /ที่ตั้งสถานที่ผลิต\s*(?:เลขที่)?/i, /ที่ตั้งสถานที่เก็บ/i)
    const storageAddr = extractBetween(text, /ที่ตั้งสถานที่เก็บ\s*(?:เลขที่)?/i, /ชื่อผู้ว่าจ้าง/i)
    const clientName = extractAfter(text, /ชื่อผู้ว่าจ้างผลิต\s*/i)
    const clientAddr = extractBetween(text, /ที่ตั้งสถานที่ประกอบธุรกิจ\s*(?:เลขที่)?/i, /กรณีแบ่งบรรจุ|เลขที่ใบรับจดแจ้ง/i)

    if (factoryAddr) result.cm_factoryAddress = factoryAddr
    if (storageAddr) result.cm_storageAddress = storageAddr
    if (clientName) result.cm_clientName = clientName
    if (clientAddr) result.cm_clientAddress = clientAddr
  }

  // ๑๐. Ingredients
  result.ingredients = parseIngredients(text)

  // Purpose
  if (/จดแจ้งเพื่อขายในประเทศไทย/.test(text)) result.purpose = "domestic"
  else if (/จดแจ้งเฉพาะเพื่อการส่งออก.*มาตรา\s*๓๕/.test(text)) result.purpose = "export_buyer_spec"
  else if (/จดแจ้งเฉพาะเพื่อการส่งออก/.test(text)) result.purpose = "export_only"

  return result
}

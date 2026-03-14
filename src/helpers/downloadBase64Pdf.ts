export function downloadBase64Pdf(base64: string, fileName: string): void {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: "application/pdf" })
  const blobUrl = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(blobUrl)
}

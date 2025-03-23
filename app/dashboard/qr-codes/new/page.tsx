import { DashboardLayout } from "@/components/dashboard-layout"
import { QrCodeCreator } from "@/components/qr-code-creator"

export default function NewQrCodePage() {
  return (
    <DashboardLayout>
      <QrCodeCreator />
    </DashboardLayout>
  )
}


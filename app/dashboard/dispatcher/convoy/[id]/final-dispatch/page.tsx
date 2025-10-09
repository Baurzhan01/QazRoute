"use client"

import { useCallback } from "react"
import { Printer } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import ReplaceAssignmentModal from "@/app/dashboard/dispatcher/components/ReplaceAssignmentModal"

import StatementRoutesTable from "./components/StatementRoutesTable"
import RemovedRoutesTable from "./components/RemovedRoutesTable"
import StatementActionModal from "./components/StatementActionModal"
import StatementEventLogModal from "./components/StatementEventLogModal"
import StatementActionLogList from "./components/StatementActionLogList"
import { useStatementConvoy } from "./hooks/useStatementConvoy"
import { StatementAction } from "./utils/constants"
import type { StatementRow } from "./types"

const StatementConvoyPage = () => {
  const router = useRouter()
  const params = useParams()
  const convoyId = (params?.id as string) || ""

  const {
    date,
    setDate,
    dateStr,
    prettyDate,
    loading,
    title,
    convoyLabel,
    activeRoutes,
    removedRows,
    pendingInputs,
    savingRows,
    scheduleAutoSave,
    handleStatementAction,
    handleStatusSubmit,
    statusSubmitting,
    replaceState,
    selectedAssignment,
    closeReplaceModal,
    statusModalState,
    closeStatusModal,
    eventLogState,
    closeLogModal,
    handleReturnToLine,
    depotId,
    refresh,
  } = useStatementConvoy({ convoyId })

  const handleRoutesAction = useCallback(
    (action: StatementAction, row: StatementRow) => {
      handleStatementAction(action, row)
    },
    [handleStatementAction]
  )

  const handleRemovedReturn = useCallback(
    (row: StatementRow) => {
      handleStatementAction(StatementAction.ReturnToLine, row)
    },
    [handleStatementAction]
  )

  const handleRemovedLog = useCallback(
    (row: StatementRow) => {
      handleStatementAction(StatementAction.ViewLog, row)
    },
    [handleStatementAction]
  )

  const handleDateChange = (value: string) => {
    const parsed = new Date(`${value}T00:00:00`)
    if (!Number.isNaN(parsed.getTime())) {
      setDate(parsed)
    }
  }

  const handlePrint = useCallback(() => {
    if (!convoyId) return
    const printUrl = `/dashboard/dispatcher/convoy/${convoyId}/final-dispatch/print?date=${dateStr}`
    window.open(printUrl, "_blank", "noopener")
  }, [convoyId, dateStr])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            ← Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-sky-700">{title}</h1>
            {convoyLabel && <p className="text-sm text-muted-foreground">{convoyLabel}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">{prettyDate}</div>
          <Input
            type="date"
            value={dateStr}
            onChange={event => handleDateChange(event.target.value)}
            className="w-[160px]"
          />
          <Button variant="outline" onClick={handlePrint} disabled={!convoyId}>
            <Printer className="mr-2 h-4 w-4" />
            Печать
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="text-muted-foreground">Загрузка данных...</div>
      ) : activeRoutes.length === 0 ? (
        <div className="text-muted-foreground">Нет актуальных выходов на выбранную дату.</div>
      ) : (
        <StatementRoutesTable
          routes={activeRoutes}
          pendingInputs={pendingInputs}
          savingRows={savingRows}
          onInputChange={scheduleAutoSave}
          onAction={handleRoutesAction}
        />
      )}

      <RemovedRoutesTable
        rows={removedRows}
        onReturn={handleRemovedReturn}
        onViewLog={handleRemovedLog}
        statusSubmitting={statusSubmitting}
      />

      {selectedAssignment && (
        <ReplaceAssignmentModal
          open={replaceState.open && Boolean(selectedAssignment)}
          onClose={closeReplaceModal}
          selectedAssignment={selectedAssignment}
          date={dateStr}
          depotId={depotId}
          onReload={refresh}
          onReplaceSuccess={() => {
            void refresh()
            closeReplaceModal()
          }}
        />
      )}

      <StatementActionModal
        state={statusModalState}
        submitting={statusSubmitting}
        onClose={closeStatusModal}
        onSubmit={handleStatusSubmit}
      />

      <StatementEventLogModal state={eventLogState} onClose={closeLogModal} />
    </div>
  )
}

export default StatementConvoyPage



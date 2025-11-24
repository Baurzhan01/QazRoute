"use client";

import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusAggregate } from "@/types/busAggregate.types";
import { buildAbsoluteUrl } from "@/app/dashboard/otk/utils";

interface DefectActModalProps {
  aggregate: BusAggregate | null;
  open: boolean;
  onClose: () => void;
}

export function DefectActModal({ aggregate, open, onClose }: DefectActModalProps) {
  const [commissionText, setCommissionText] = useState(
    " "
  );
  const [diagnosis, setDiagnosis] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [notes, setNotes] = useState("");
  const [approverTitle, setApproverTitle] = useState("Главный инженер");
  const [approverCompany, setApproverCompany] = useState('АО "Автобусный парк №1"');
  const [approverName, setApproverName] = useState("Тлеубергенов Б.Т.");
  const [signers, setSigners] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);

  const attachments = useMemo(() => aggregate?.urls ?? [], [aggregate?.urls]);

  const formattedDate = useMemo(() => {
    if (!aggregate?.date) return "";
    const d = new Date(aggregate.date);
    if (isNaN(d.getTime())) return aggregate.date;
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) + " года";
  }, [aggregate?.date]);

  const memberNames = useMemo(
    () =>
      signers
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [signers]
  );

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=1200");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Дефектный акт</title>
          <style>
            @page { size: A4; margin: 18mm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 14px; color: #0f172a; line-height: 1.45; }
            h1 { font-size: 18px; font-weight: 700; text-align: center; margin: 18px 0 18px; }
            h2 { font-size: 14px; font-weight: 700; margin: 12px 0 6px; }
            .block { margin-bottom: 14px; }
            .approval { text-align: right; line-height: 1.4; font-size: 12px; font-weight: 700; }
            .photos { display: flex; gap: 12px; flex-wrap: wrap; margin: 10px 0; }
            .photos img { width: 240px; height: 170px; object-fit: cover; border: 1px solid #e2e8f0; display: block; }
            .sign-row { display: flex; gap: 8px; align-items: center; margin: 6px 0; }
            .line { width: 110px; border-bottom: 1px solid #0f172a; display: inline-block; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; }
            .date { font-weight: 700; margin: 8px 0 12px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    const finishPrint = () => {
      win.focus();
      win.print();
      setTimeout(() => win.close(), 200);
    };

    const images = Array.from(win.document.images || []);

    if (images.length === 0) {
      win.onload = finishPrint;
      return;
    }

    let loaded = 0;
    const handleReady = () => {
      loaded += 1;
      if (loaded >= images.length) finishPrint();
    };

    images.forEach((img) => {
      if (img.complete) {
        handleReady();
      } else {
        img.onload = handleReady;
        img.onerror = handleReady;
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none sm:max-w-[90vw] lg:max-w-[1400px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Дефектный акт</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pr-1 max-h-[78vh] overflow-y-auto">
          <div className="grid gap-3 md:grid-cols-[1.8fr_1fr]">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
              <div className="font-semibold">
                Автобус: {aggregate?.busGovNumber || "—"} · гараж {aggregate?.busGarageNumber || "—"}
              </div>
              <div className="text-slate-600">Дата фиксации: {formattedDate || "—"}</div>
            </div>
            <div className="rounded-lg border p-4 text-sm space-y-2">
              <div className="text-right text-xs text-muted-foreground">«Утверждаю»</div>
              <Textarea
                value={`${approverTitle}\n${approverCompany}\n______________ ${approverName}`}
                onChange={(e) => {
                  const lines = e.target.value.split("\n");
                  setApproverTitle(lines[0] ?? "");
                  setApproverCompany(lines[1] ?? "");
                  setApproverName((lines[2] || "").replace("______________ ", ""));
                }}
                className="resize-none text-xs h-[110px] leading-snug"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border p-4 space-y-2">
              <Label className="text-sm font-semibold">Комиссия в составе</Label>
              <Textarea rows={4} value={commissionText} onChange={(e) => setCommissionText(e.target.value)} className="resize-none" />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <Label className="text-sm font-semibold">Подписанты (ФИО и должности)</Label>
              <Textarea
                rows={3}
                value={signers}
                onChange={(e) => setSigners(e.target.value)}
                placeholder="Фамилия И.О., должность"
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <Label className="text-sm font-semibold">При диагностике установлено</Label>
              <Textarea rows={3} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="resize-none" />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <Label className="text-sm font-semibold">Заключение комиссии</Label>
              <Textarea rows={3} value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="resize-none" />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <Label className="text-sm font-semibold">Комментарии/замечания</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" />
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 rounded-lg border p-4">
              <Label className="text-sm font-semibold">Фото</Label>
              <div className="grid grid-cols-2 gap-3">
                {attachments.map((u) => (
                  <div key={u} className="overflow-hidden rounded border">
                    <img src={buildAbsoluteUrl(u)} alt="Фото дефекта" className="h-48 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Печатная версия (скрыта в модалке, используется только при печати) */}
        <div className="hidden" ref={printRef}>
          <div className="header">
            <div />
            <div className="approval">
              <div>«Утверждаю»</div>
              <div>{approverTitle}</div>
              <div>{approverCompany}</div>
              <div>______________ {approverName}</div>
            </div>
          </div>

          <h1>Дефектный акт</h1>
          <div className="date">{formattedDate || "____ __________ ____ года"}</div>

          <div className="block">
            <h2>Комиссия в составе</h2>
            <pre className="whitespace-pre-wrap">{commissionText}</pre>
          </div>

          <div className="block">
            <h2>При диагностике установлено</h2>
            <pre className="whitespace-pre-wrap">{diagnosis}</pre>
          </div>

          {attachments.length > 0 && (
            <div className="block">
              <div className="photos">
                {attachments.map((u) => (
                  <img key={u} src={buildAbsoluteUrl(u)} alt="Фото дефекта" />
                ))}
              </div>
            </div>
          )}

          <div className="block">
            <h2>Заключение комиссии</h2>
            <pre className="whitespace-pre-wrap">{conclusion}</pre>
          </div>

          <div className="block">
            <h2>Комментарии</h2>
            <pre className="whitespace-pre-wrap">{notes}</pre>
          </div>

          <div className="block">
            <h2>Подписи</h2>
            {memberNames.length === 0 && (
              <div className="sign-row">
                <span className="line" />
              </div>
            )}
            {memberNames.map((name, idx) => (
              <div key={`${name}-${idx}`} className="sign-row">
                <span>{name}</span>
                <span className="line" />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={handlePrint}>Печать акта</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

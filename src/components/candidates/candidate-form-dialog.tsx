import { Pencil, Plus } from "lucide-react";
import { useState, type SubmitEvent, type ReactNode } from "react";

import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CANDIDATE_SOURCES, CANDIDATE_STATUSES } from "@/constants/candidates";
import { useCreateCandidateMutation, useEditCandidateMutation } from "@/store/candidates-api";
import type { Candidate, CreateCandidateRequest } from "@/types/candidate";
import { toIsoDate } from "@/utils/dates";
import { toSkillList } from "@/utils/skills";

const EMPTY_FORM = {
    name: "",
  email: "",
  phone: "",
  location: "",
  primary_skill: "",
  experience_years: "0",
  experience_months: "0",
  skills: "",
  current_ctc_amount: "",
  expected_ctc_amount: "",
  current_ctc_currency: "INR",
  expected_ctc_currency: "INR",
  notice_days: "",
  availability: "",
  source: "job_board",
  status: "active",
  recruiter_notes: "",
  last_contacted_on: "",
}


type CandidateForm = typeof EMPTY_FORM;

function toForm(candidate: Candidate): CandidateForm {
    return {
      name: candidate.name ?? "",
      email: candidate.email,
      phone: candidate.phone,
      location: candidate.location ?? "",
      primary_skill: candidate.primary_skill,
      experience_years: String(candidate.experience_years ?? 0),
      experience_months: String(candidate.experience_months ?? 0),
      skills: toSkillList(candidate.skills).join(", "),
      current_ctc_amount: candidate.current_ctc_amount != null ? String(candidate.current_ctc_amount) : "",
      expected_ctc_amount: candidate.expected_ctc_amount != null ? String(candidate.expected_ctc_amount) : "",
      current_ctc_currency: candidate.current_ctc_currency ?? "INR",
      expected_ctc_currency: candidate.expected_ctc_currency ?? "INR",
      notice_days: candidate.notice_days != null ? String(candidate.notice_days) : "",
      availability: candidate.availability ?? "",
      source: candidate.source ?? "job_board",
      status: candidate.status ?? "active",
      recruiter_notes: candidate.recruiter_notes ?? "",
      last_contacted_on: toIsoDate(candidate.last_contacted_on),
    };
  }

export function CandidateFormDialog({candidate}:{candidate?:Candidate}) {

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CandidateForm>(EMPTY_FORM);
  const [createCandidate, createState] = useCreateCandidateMutation();
  const [editCandidate, editState] = useEditCandidateMutation();

  const isLoading = createState.isLoading || editState.isLoading;
  const error = candidate ? editState.error : createState.error;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && candidate) {
      setForm(toForm(candidate));
    }
    setOpen(nextOpen);
  }
  function update(field: keyof CandidateForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // Turn the text fields into the shape Django expects.
    const payload: CreateCandidateRequest = {
        ...form,
        experience_years: Number(form.experience_years),
        experience_months: Number(form.experience_months),
        current_ctc_amount: Number(form.current_ctc_amount),
        expected_ctc_amount: Number(form.expected_ctc_amount),
        notice_days: Number(form.notice_days),
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
        last_contacted_on: form.last_contacted_on || null,
      };
  
      try {
        if (candidate) {
          await editCandidate({ candidate_id: candidate.id, ...payload }).unwrap();
        } else {
          await createCandidate(payload).unwrap();
          setForm(EMPTY_FORM); // clear only after a create
        }
        setOpen(false);
      } catch {
        // Failed: keep the dialog open so nothing typed is lost. The message shows from `error`.
      }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            {candidate ? (
              <Button variant="ghost" size="icon" aria-label={`Edit ${candidate.name ?? "candidate"}`}>
                <Pencil className="size-4" />
              </Button>
            ) : (
              <Button>
                <Plus className="size-4" /> New candidate
              </Button>
            )}
          </DialogTrigger>
    
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{candidate ? `Edit ${candidate.name ?? "candidate"}` : "New candidate"}</DialogTitle>
              <DialogDescription>
                Candidates stay in the database and can be matched to many requirements.
              </DialogDescription>
            </DialogHeader>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" id="name">
                  <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </Field>
                <Field label="Email" id="email">
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </Field>
                <Field label="Phone" id="phone">
                  <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
                </Field>
                <Field label="Location" id="location">
                  <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} required />
                </Field>
                <Field label="Primary skill" id="primary_skill">
                  <Input id="primary_skill" value={form.primary_skill} onChange={(e) => update("primary_skill", e.target.value)} required />
                </Field>
                <Field label="Experience (years)" id="experience_years">
                  <Input id="experience_years" type="number" min="0" step="1" value={form.experience_years} onChange={(e) => update("experience_years", e.target.value)} required />
                </Field>
                <Field label="Experience (months)" id="experience_months">
                  <Input id="experience_months" type="number" min="0" max="11" step="1" value={form.experience_months} onChange={(e) => update("experience_months", e.target.value)} required />
                </Field>
              </div>
    
              <Field label="Skills" id="skills" hint="Separate skills with commas.">
                <Input id="skills" placeholder="React, TypeScript, Node" value={form.skills} onChange={(e) => update("skills", e.target.value)} required />
              </Field>
    
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current CTC (INR)" id="current_ctc_amount">
                  <Input id="current_ctc_amount" type="number" min="0" value={form.current_ctc_amount} onChange={(e) => update("current_ctc_amount", e.target.value)} required />
                </Field>
                <Field label="Expected CTC (INR)" id="expected_ctc_amount">
                  <Input id="expected_ctc_amount" type="number" min="0" value={form.expected_ctc_amount} onChange={(e) => update("expected_ctc_amount", e.target.value)} required />
                </Field>
                <Field label="Notice period (days)" id="notice_days">
                  <Input id="notice_days" type="number" min="0" value={form.notice_days} onChange={(e) => update("notice_days", e.target.value)} required />
                </Field>
                <Field label="Availability" id="availability">
                  <Input id="availability" placeholder="e.g. Immediate, after 1 Dec" value={form.availability} onChange={(e) => update("availability", e.target.value)} />
                </Field>
                <Field label="Last contacted on" id="last_contacted_on">
                  <DatePicker id="last_contacted_on" value={form.last_contacted_on} onChange={(value) => update("last_contacted_on", value)} />
                </Field>
                <Field label="Source" id="source">
                  <Select value={form.source} onValueChange={(value) => update("source", value)}>
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_SOURCES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status" id="status">
                  <Select value={form.status} onValueChange={(value) => update("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_STATUSES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
    
              <Field label="Recruiter notes" id="recruiter_notes">
                <Textarea id="recruiter_notes" value={form.recruiter_notes} onChange={(e) => update("recruiter_notes", e.target.value)} />
              </Field>
    
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
    
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving…" : candidate ? "Save changes" : "Save candidate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );

}

function Field({
    label,
    id,
    hint,
    children,
  }: {
    label: string;
    id: string;
    hint?: string;
    children: ReactNode;
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    );
  }
  
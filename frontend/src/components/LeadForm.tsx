"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { submitLead, ApiRequestError } from "@/lib/api";
import { BUDGET_RANGES } from "@/lib/types";
import type { BudgetRange } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BUDGET_OPTIONS = BUDGET_RANGES.map((b) => ({ value: b, label: b }));

interface FormData {
  name: string;
  email: string;
  budget_range: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  budget_range?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  // Name
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (trimmedName.length > 100) {
    errors.name = "Name must be at most 100 characters.";
  }

  // Email
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Budget range
  if (!data.budget_range) {
    errors.budget_range = "Please select a budget range.";
  }

  // Message
  const trimmedMessage = data.message.trim();
  if (!trimmedMessage) {
    errors.message = "Message is required.";
  } else if (trimmedMessage.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  } else if (trimmedMessage.length > 2000) {
    errors.message = "Message must be at most 2,000 characters.";
  }

  return errors;
}

export default function LeadForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    budget_range: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (generalError) setGeneralError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");

    // Client-side validation
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await submitLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        budget_range: formData.budget_range as BudgetRange,
        message: formData.message.trim(),
      });

      setSubmitted(true);
      setFormData({ name: "", email: "", budget_range: "", message: "" });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 422 && err.data.details) {
          // Map server-side field errors back to form fields
          const serverErrors: FormErrors = {};
          for (const [field, messages] of Object.entries(err.data.details)) {
            const key = field as keyof FormErrors;
            if (key in formData) {
              serverErrors[key] = messages.join(" ");
            }
          }
          setErrors(serverErrors);
        } else {
          setGeneralError(err.data.message || "Something went wrong.");
        }
      } else {
        setGeneralError("Network error. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 mb-6">
          <svg
            className="w-8 h-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Thank you for reaching out!
        </h3>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <Button
          variant="secondary"
          onClick={() => setSubmitted(false)}
        >
          Submit another inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          id="lead-name"
          name="name"
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          maxLength={100}
        />
        <Input
          id="lead-email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
      </div>

      <Select
        id="lead-budget"
        name="budget_range"
        label="Budget Range"
        placeholder="Select your budget range"
        options={BUDGET_OPTIONS}
        value={formData.budget_range}
        onChange={handleChange}
        error={errors.budget_range}
      />

      <Textarea
        id="lead-message"
        name="message"
        label="Project Details"
        placeholder="Tell us about your project, goals, and timeline..."
        value={formData.message}
        onChange={handleChange}
        error={errors.message}
        rows={4}
        maxLength={2000}
      />

      {generalError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {generalError}
        </div>
      )}

      <Button type="submit" loading={submitting} className="w-full" size="lg">
        Send Inquiry
      </Button>
    </form>
  );
}

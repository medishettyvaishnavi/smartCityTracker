import { useForm } from "react-hook-form";
import { useState } from "react";
import "./ReportComplaint.css";

const CATEGORIES = [
  { value: "", label: "-- Select a category --" },
  { value: "roads", label: "🛣️ Roads & Potholes" },
  { value: "water", label: "💧 Water Supply" },
  { value: "electricity", label: "⚡ Electricity" },
  { value: "sanitation", label: "🗑️ Sanitation & Garbage" },
  { value: "streetlights", label: "💡 Street Lights" },
  { value: "parks", label: "🌳 Parks & Public Spaces" },
  { value: "drainage", label: "🌊 Drainage & Flooding" },
  { value: "noise", label: "🔊 Noise Pollution" },
  { value: "traffic", label: "🚦 Traffic & Signals" },
  { value: "other", label: "📋 Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "var(--status-resolved-text)" },
  { value: "medium", label: "Medium", color: "var(--status-inprogress-text)" },
  { value: "high", label: "High", color: "var(--status-pending-text)" },
];

function ReportComplaint() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [charCount, setCharCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { priority: "medium" } });

  const onSubmit = async (data) => {
    await new Promise((res) => setTimeout(res, 1200));
    console.log("Complaint submitted:", { ...data, priority: selectedPriority });
    setSubmitted(true);
  };

  const handleReset = () => {
    reset();
    setSubmitted(false);
    setSelectedPriority("medium");
    setCharCount(0);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (submitted) {
    return (
      <div className="rc-wrapper">
        <div className="rc-success-card">
          <div className="rc-success-icon">✅</div>
          <h2>Complaint Submitted!</h2>
          <p>
            Your complaint has been registered successfully. Our team will review
            it shortly. Track progress under <strong>My Complaints</strong>.
          </p>
          <div className="rc-success-id">
            Reference ID: <strong>#SCT-{Date.now().toString().slice(-6)}</strong>
          </div>
          <button className="rc-btn rc-btn-primary" onClick={handleReset}>
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rc-wrapper">
      <div className="rc-container">
        <div className="rc-header">
          <div className="rc-header-icon">📢</div>
          <div>
            <h1 className="rc-title">Report a City Issue</h1>
            <p className="rc-subtitle">
              Help us improve your city — every complaint matters.
            </p>
          </div>
        </div>

        <form className="rc-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Full Name + Email */}
          <div className="rc-row">
            <div className="rc-field">
              <label className="rc-label" htmlFor="fullName">
                Full Name <span className="rc-required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className={`rc-input ${errors.fullName ? "rc-input-error" : ""}`}
                placeholder="John Doe"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
              />
              {errors.fullName && <span className="rc-error">{errors.fullName.message}</span>}
            </div>

            <div className="rc-field">
              <label className="rc-label" htmlFor="email">
                Email Address <span className="rc-required">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`rc-input ${errors.email ? "rc-input-error" : ""}`}
                placeholder="john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && <span className="rc-error">{errors.email.message}</span>}
            </div>
          </div>

          {/* Phone + Category */}
          <div className="rc-row">
            <div className="rc-field">
              <label className="rc-label" htmlFor="phone">
                Phone Number <span className="rc-required">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={`rc-input ${errors.phone ? "rc-input-error" : ""}`}
                placeholder="+91 98765 43210"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[+]?[\d\s\-()]{7,15}$/,
                    message: "Enter a valid phone number",
                  },
                })}
              />
              {errors.phone && <span className="rc-error">{errors.phone.message}</span>}
            </div>

            <div className="rc-field">
              <label className="rc-label" htmlFor="category">
                Issue Category <span className="rc-required">*</span>
              </label>
              <select
                id="category"
                className={`rc-input rc-select ${errors.category ? "rc-input-error" : ""}`}
                {...register("category", { required: "Please select a category" })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && <span className="rc-error">{errors.category.message}</span>}
            </div>
          </div>

          {/* Complaint Title */}
          <div className="rc-field">
            <label className="rc-label" htmlFor="title">
              Complaint Title <span className="rc-required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`rc-input ${errors.title ? "rc-input-error" : ""}`}
              placeholder="e.g. Large pothole on MG Road near Bus Stand"
              {...register("title", {
                required: "Complaint title is required",
                minLength: { value: 10, message: "Title must be at least 10 characters" },
                maxLength: { value: 120, message: "Title must not exceed 120 characters" },
              })}
            />
            {errors.title && <span className="rc-error">{errors.title.message}</span>}
          </div>

          {/* Address + PIN */}
          <div className="rc-row">
            <div className="rc-field">
              <label className="rc-label" htmlFor="address">
                Street Address / Landmark <span className="rc-required">*</span>
              </label>
              <input
                id="address"
                type="text"
                className={`rc-input ${errors.address ? "rc-input-error" : ""}`}
                placeholder="e.g. Near Central Park, MG Road"
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && <span className="rc-error">{errors.address.message}</span>}
            </div>

            <div className="rc-field">
              <label className="rc-label" htmlFor="pincode">
                PIN Code <span className="rc-required">*</span>
              </label>
              <input
                id="pincode"
                type="text"
                className={`rc-input ${errors.pincode ? "rc-input-error" : ""}`}
                placeholder="560001"
                maxLength={6}
                {...register("pincode", {
                  required: "PIN code is required",
                  pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit PIN code" },
                })}
              />
              {errors.pincode && <span className="rc-error">{errors.pincode.message}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="rc-field">
            <label className="rc-label" htmlFor="description">
              Detailed Description <span className="rc-required">*</span>
            </label>
            <textarea
              id="description"
              className={`rc-input rc-textarea ${errors.description ? "rc-input-error" : ""}`}
              placeholder="Describe the issue — when did it start, how severe is it, how many people are affected..."
              rows={5}
              maxLength={1000}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 30, message: "Please provide at least 30 characters" },
                onChange: (e) => setCharCount(e.target.value.length),
              })}
            />
            <div className="rc-char-count">{charCount} / 1000</div>
            {errors.description && <span className="rc-error">{errors.description.message}</span>}
          </div>

          {/* Priority */}
          <div className="rc-field">
            <label className="rc-label">
              Priority Level <span className="rc-required">*</span>
            </label>
            <div className="rc-priority-group">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`rc-priority-btn ${selectedPriority === p.value ? "rc-priority-active" : ""}`}
                  style={{ "--priority-color": p.color }}
                  onClick={() => setSelectedPriority(p.value)}
                >
                  <span className="rc-priority-dot" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="rc-field">
            <label className="rc-label" htmlFor="image">
              Attach Photo <span className="rc-optional">(optional)</span>
            </label>
            <label className="rc-file-label" htmlFor="image">
              <span className="rc-file-icon">📎</span>
              <span>Click to upload or drag &amp; drop</span>
              <span className="rc-file-hint">PNG, JPG, WEBP up to 5MB</span>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="rc-file-input"
                {...register("image")}
                onChange={handleImageChange}
              />
            </label>
            {imagePreview && (
              <div className="rc-image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" className="rc-remove-image" onClick={() => setImagePreview(null)}>
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {/* Consent */}
          <div className="rc-field rc-checkbox-field">
            <label className="rc-checkbox-label">
              <input
                type="checkbox"
                className="rc-checkbox"
                {...register("consent", { required: "You must agree to proceed" })}
              />
              <span>
                I confirm that the information provided is accurate and I agree to the{" "}
                <a href="#" className="rc-link">Terms of Service</a>.{" "}
                <span className="rc-required">*</span>
              </span>
            </label>
            {errors.consent && <span className="rc-error">{errors.consent.message}</span>}
          </div>

          {/* Actions */}
          <div className="rc-actions">
            <button type="button" className="rc-btn rc-btn-ghost" onClick={handleReset}>
              Clear Form
            </button>
            <button type="submit" className="rc-btn rc-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <span className="rc-spinner" /> : "Submit Complaint"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReportComplaint;
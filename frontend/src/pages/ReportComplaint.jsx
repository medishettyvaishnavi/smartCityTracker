import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import complaintService from "../services/complaintService";
import { Spinner, Alert } from "../components/common";
import "./ReportComplaint.css";

const CATEGORIES = [
  { value: "", label: "-- Select a category --" },
  { value: "Roads & Infrastructure", label: "🛣️ Roads & Infrastructure" },
  { value: "Water Supply", label: "💧 Water Supply" },
  { value: "Electricity", label: "⚡ Electricity" },
  { value: "Sanitation & Garbage", label: "🗑️ Sanitation & Garbage" },
  { value: "Public Safety", label: "🛡️ Public Safety" },
  { value: "Parks & Recreation", label: "🌳 Parks & Recreation" },
  { value: "Noise Pollution", label: "🔊 Noise Pollution" },
  { value: "Other", label: "📋 Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "var(--status-resolved-text)" },
  { value: "medium", label: "Medium", color: "var(--status-inprogress-text)" },
  { value: "high", label: "High", color: "var(--status-pending-text)" },
];

function ReportComplaint() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [createdComplaint, setCreatedComplaint] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("medium");
  const [charCount, setCharCount] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      city: "Hyderabad",
      priority: "medium",
    },
  });

  useEffect(() => {
    if (user?.name) setValue("fullName", user.name);
    if (user?.email) setValue("email", user.email);
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    try {
      const created = await complaintService.createComplaint({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: selectedPriority,
        address: data.address,
        city: data.city || "Hyderabad",
        pincode: data.pincode,
        imagePreview,
      });
      setCreatedComplaint(created);
    } catch (err) {
      console.error("Complaint submission error:", err);
      const message =
        err.response?.data?.message ||
        (err.request
          ? "Unable to connect to the server"
          : err.message || "Failed to submit complaint. Please check your connection and try again.");
      setSubmitError(message);
    }
  };

  const handleReset = () => {
    reset();
    setCreatedComplaint(null);
    setSelectedPriority("medium");
    setCharCount(0);
    setImagePreview(null);
    setSubmitError(null);
    if (user?.name) setValue("fullName", user.name);
    if (user?.email) setValue("email", user.email);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (createdComplaint) {
    return (
      <div className="rc-wrapper">
        <div className="rc-success-card">
          <div className="rc-success-icon">✅</div>
          <h2>{t("submitComplaint")}!</h2>
          <p>
            Your complaint has been registered successfully on the smart city network.
            Track progress and updates under <strong>My Complaints</strong>.
          </p>
          <div className="rc-success-id">
            Reference ID: <strong>#{createdComplaint.id}</strong>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "16px" }}>
            <Link to={`/complaints/${createdComplaint.id}`} className="rc-btn rc-btn-primary">
              {t("viewDetails")} →
            </Link>
            <button className="rc-btn rc-btn-ghost" onClick={handleReset}>
              Submit Another Complaint
            </button>
          </div>
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
            <h1 className="rc-title">{t("reportComplaint")}</h1>
            <p className="rc-subtitle">
              Help us improve your city — every complaint is logged directly in MongoDB.
            </p>
          </div>
        </div>

        {submitError && (
          <Alert
            type="error"
            message={submitError}
            style={{ marginBottom: "20px" }}
          />
        )}

        <form className="rc-form" onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Full Name + Email */}
          <div className="rc-row">
            <div className="rc-field">
              <label className="rc-label" htmlFor="fullName">
                {t("fullName")} <span className="rc-required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                className={`rc-input ${errors.fullName ? "rc-input-error" : ""}`}
                placeholder="Citizen Name"
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
                placeholder="citizen@example.com"
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

          {/* Category */}
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

          {/* Complaint Title */}
          <div className="rc-field">
            <label className="rc-label" htmlFor="title">
                {t("title")} <span className="rc-required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`rc-input ${errors.title ? "rc-input-error" : ""}`}
              placeholder="e.g. Broken water pipe causing street overflow"
              {...register("title", {
                required: "Complaint title is required",
                minLength: { value: 6, message: "Title must be at least 6 characters" },
                maxLength: { value: 120, message: "Title must not exceed 120 characters" },
              })}
            />
            {errors.title && <span className="rc-error">{errors.title.message}</span>}
          </div>

          {/* Address, City + PIN */}
          <div className="rc-row">
            <div className="rc-field" style={{ flex: 2 }}>
              <label className="rc-label" htmlFor="address">
                {t("location")} / Landmark <span className="rc-required">*</span>
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

            <div className="rc-field" style={{ flex: 1 }}>
              <label className="rc-label" htmlFor="city">
                City <span className="rc-required">*</span>
              </label>
              <input
                id="city"
                type="text"
                className={`rc-input ${errors.city ? "rc-input-error" : ""}`}
                placeholder="Hyderabad"
                {...register("city", { required: "City is required" })}
              />
              {errors.city && <span className="rc-error">{errors.city.message}</span>}
            </div>

            <div className="rc-field" style={{ flex: 1 }}>
              <label className="rc-label" htmlFor="pincode">
                PIN Code <span className="rc-optional">(optional)</span>
              </label>
              <input
                id="pincode"
                type="text"
                className={`rc-input ${errors.pincode ? "rc-input-error" : ""}`}
                placeholder="500081"
                maxLength={6}
                {...register("pincode")}
              />
              {errors.pincode && <span className="rc-error">{errors.pincode.message}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="rc-field">
            <label className="rc-label" htmlFor="description">
              {t("description")} <span className="rc-required">*</span>
            </label>
            <textarea
              id="description"
              className={`rc-input rc-textarea ${errors.description ? "rc-input-error" : ""}`}
              placeholder="Describe the issue — when did it start, how severe is it, what is affected..."
              rows={5}
              maxLength={1000}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 15, message: "Please provide at least 15 characters" },
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
              <span>Click to upload photo</span>
              <span className="rc-file-hint">PNG, JPG, WEBP up to 5MB</span>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="rc-file-input"
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
                {...register("consent", { required: "You must confirm to proceed" })}
              />
              <span>
                I confirm that the information provided is accurate and represent a genuine civic issue.{" "}
                <span className="rc-required">*</span>
              </span>
            </label>
            {errors.consent && <span className="rc-error">{errors.consent.message}</span>}
          </div>

          {/* Actions */}
          <div className="rc-actions">
            <button type="button" className="rc-btn rc-btn-ghost" onClick={handleReset}>
              {t("clearForm")}
            </button>
            <button type="submit" className="rc-btn rc-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" color="#fff" /> : "Submit Complaint"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ReportComplaint;
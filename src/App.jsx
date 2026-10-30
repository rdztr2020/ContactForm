import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./App.css";

const RATE_LIMIT_MS = 15000;
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 10;
const MAX_SUBJECT_LENGTH = 100;
const MIN_SUBJECT_LENGTH = 3;
const MIN_NAME_LENGTH = 2;
const HONEYPOT_FIELD_NAME = "company";

function App() {
  const form = useRef();
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState(0);
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  const validateForm = (formData) => {
    const name = (formData.get("user_name") || "").toString().trim();
    const email = (formData.get("user_email") || "").toString().trim();
    const subject = (formData.get("subject") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    const honeypot = (formData.get(HONEYPOT_FIELD_NAME) || "").toString().trim();

    if (honeypot) {
      return { valid: false, message: "Submission rejected." };
    }

    if (name.length < MIN_NAME_LENGTH) {
      return { valid: false, message: "Please enter your full name." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { valid: false, message: "Please enter a valid email address." };
    }

    if (subject.length < MIN_SUBJECT_LENGTH || subject.length > MAX_SUBJECT_LENGTH) {
      return { valid: false, message: "Please enter a subject between 3 and 100 characters." };
    }

    if (message.length < MIN_MESSAGE_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, message: `Please enter a message between ${MIN_MESSAGE_LENGTH} and ${MAX_MESSAGE_LENGTH} characters.` };
    }

    if (/(https?:\/\/|www\.)/i.test(message) || /(https?:\/\/|www\.)/i.test(subject)) {
      return { valid: false, message: "Links are not allowed in this form." };
    }

    return { valid: true };
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (Date.now() - lastSubmittedAt < RATE_LIMIT_MS) {
      setFeedback({ type: "error", message: "Please wait a moment before sending another message." });
      return;
    }

    const formData = new FormData(form.current);
    const validation = validateForm(formData);

    if (!validation.valid) {
      setFeedback({ type: "error", message: validation.message });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey,
      })
      .then(
        () => {
          setFeedback({ type: "success", message: "Message sent" });
          setLastSubmittedAt(Date.now());
          form.current.reset();

          window.setTimeout(() => {
            setFeedback({ type: "", message: "" });
          }, 10000);
        },
        (error) => {
          console.log("FAILED...", error.text);
          setFeedback({ type: "error", message: "Unable to send your message right now. Please try again later." });
        },
      )
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <main className="contact-page">
      <section className="contact-card" aria-label="Contact us">
        <aside className="contact-aside">
          <div className="contact-brand">
            <span className="contact-brand-mark" aria-hidden="true">✦</span>
            <span>We'd love to hear from you</span>
          </div>
          <div className="aside-copy">
            <p className="aside-eyebrow">Get in touch</p>
            <h2>Let’s start a conversation.</h2>
            <p className="aside-description">
              Have a question or an idea? Send us a note and we’ll get back to you as soon as we can.
            </p>
          </div>
          <ul className="contact-details">
            <li className="contact-detail">
              <span className="contact-detail-icon" aria-hidden="true">@</span>
              <span>We typically reply within 1–2 business days</span>
            </li>
          </ul>
        </aside>

        <form ref={form} onSubmit={sendEmail} className="contact-form">
          <p className="form-eyebrow">Contact us</p>
          <h1>Send us a message</h1>
          <p className="form-intro">Fill in the form below and our team will be in touch.</p>

          {feedback.message && (
            <div
              role="status"
              aria-live="polite"
              className={`form-feedback ${feedback.type === "error" ? "form-feedback--error" : "form-feedback--success"}`}
            >
              {feedback.message}
            </div>
          )}

          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="user_name">Full name</label>
              <input
                id="user_name"
                type="text"
                name="user_name"
                placeholder="Jane Smith"
                autoComplete="name"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="user_email">Email address</label>
              <input
                id="user_email"
                type="email"
                name="user_email"
                placeholder="jane@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="How can we help?"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us a little more about what you need..."
                required
              />
            </div>
          </div>

          <input
            type="text"
            name={HONEYPOT_FIELD_NAME}
            tabIndex={-1}
            autoComplete="off"
            className="honeypot"
            aria-hidden="true"
          />
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? "Sending..." : "Send message"}
            {!isSubmitting && <span className="submit-arrow" aria-hidden="true">→</span>}
          </button>
          <p className="form-note">Your information will only be used to respond to your inquiry.</p>
        </form>
      </section>
    </main>
  );
}

export default App;

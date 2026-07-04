import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

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
    <div>
      {feedback.message && (
        <div
          role="status"
          aria-live="polite"
          className={`mx-auto mb-4 w-85 rounded-full px-4 py-2 text-sm ${feedback.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
        >
          {feedback.message}
        </div>
      )}
      <form
        ref={form}
        onSubmit={sendEmail}
        action=""
        className="flex flex-col items-center justify-center mt-[5%] "
      >
        <h1 className="flex items-center justify-center font-semibold text-4xl">
          Contact Us
        </h1>
        <input
          type="text"
          name="user_name"
          placeholder="Enter fullname"
          className="rounded-full border-2 border-[#aaa] border-solid p-5 w-85 mt-5"
          required
        />
        <input
          type="email"
          name="user_email"
          placeholder="Enter email"
          className="rounded-full border-2 border-[#aaa] border-solid p-5 w-85 mt-5"
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Enter Subject"
          className="rounded-full border-2 border-[#aaa] border-solid p-5 w-85 mt-5"
          required
        />
        <textarea
          type="text"
          name="message"
          cols={40}
          rows={7}
          placeholder="Leave a message"
          className="rounded-lg border-2 border-[#aaa] border-solid  p-5 w-85 mt-5"
        />
        <input
          type="text"
          name={HONEYPOT_FIELD_NAME}
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#646cff] p-5 text-white rounded-full border-none font-semibold cursor-pointer w-85 mt-5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

export default App;

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

function App() {
  const form = useRef();
  const [showSuccess, setShowSuccess] = useState(false);
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(serviceId, templateId, form.current, {
        publicKey,
      })
      .then(
        () => {
          setShowSuccess(true);
          window.setTimeout(() => setShowSuccess(false), 5000);
          console.log("SUCCESS!");
        },
        (error) => {
          console.log("FAILED...", error.text);
        },
      );

    e.target.reset();
  };

  return (
    <div>
      {showSuccess && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-green-600 px-6 py-3 text-white shadow-lg">
          Message sent successfully!
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
        <button
          type="submit"
          className="bg-[#646cff] p-5 text-white rounded-full border-none font-semibold cursor-pointer w-85 mt-5"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default App;

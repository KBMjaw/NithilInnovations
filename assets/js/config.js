/*
 * Nithil Innovations – site configuration
 * Edit the values below; no other file needs to change for contact details,
 * social links or the enquiry form.
 */
window.NITHIL_CONFIG = {
  company: "Nithil Innovations",

  // Contact details (email is "to be finalized" – update here when ready)
  email: "nithilinnovation@gmail.com",
  phoneDisplay: "+91 98428 30590",
  phoneTel: "+919842830590",
  whatsappNumber: "919842830590", // country code + number, digits only
  whatsappMessage: "Hello Nithil Innovations, I would like to discuss a project.",
  address: "96, Cholan Street, Chennimalai, Tamil Nadu 638051",

  // Social links – leave "" to hide an icon. Replace with official URLs when available.
  social: {
    linkedin: "https://www.linkedin.com/company/nithil-innovations/",
    instagram: "https://www.instagram.com/nithil_innovation/",
    facebook: "https://www.facebook.com/nithil_innovation/",
    youtube: ""
  },

  /*
   * Blog backend (Supabase). Run supabase/blog.sql once, then paste the project URL and the
   * publishable (anon) key here. The anon key is safe to expose – Row Level Security protects writes.
   */
  supabase: {
    url: "",     // e.g. "https://xxxx.supabase.co"
    anonKey: ""  // publishable / anon key
  },

  /*
   * Enquiry form delivery (works on Vercel, Netlify and GitHub Pages – no server needed).
   * 1. Go to https://web3forms.com, enter the email that should receive enquiries.
   * 2. Paste the free "Access Key" they email you below.
   * Until a key is set, the form falls back to opening the visitor's email app
   * with the enquiry pre-filled (so no enquiry is silently lost).
   */
  form: {
    provider: "web3forms",
    accessKey: "", // <-- paste Web3Forms access key here
    endpoint: "https://api.web3forms.com/submit",
    subject: "New website enquiry – Nithil Innovations"
  }
};

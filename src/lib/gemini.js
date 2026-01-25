import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Inisialisasi hanya jika API Key ada
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const generateScript = async (prompt) => {
  if (!genAI) {
    console.error("Gemini API Key missing");
    return "Error: API Key Gemini belum dikonfigurasi.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, AI sedang sibuk. Coba lagi nanti.";
  }
};

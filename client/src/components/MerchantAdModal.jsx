import { useState } from "react";
import { X, Megaphone, Upload, PhoneCall, CheckCircle2, Sparkles, Image, CreditCard, Video, Film } from "lucide-react";
import { submitAdRequest } from "../services/adService";

function MerchantAdModal({ isOpen, onClose, onSubmitted }) {
  const [businessName, setBusinessName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [posterType, setPosterType] = useState("image"); // "image" | "video"
  const [posterImage, setPosterImage] = useState("");
  const [posterVideo, setPosterVideo] = useState("");
  const [receiptImage, setReceiptImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = (e, setImageFn) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFn(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterVideo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName || !contactPhone || !title) {
      alert("Please fill in Business Name, Phone, and Promotion Title.");
      return;
    }

    if (posterType === "image" && !posterImage) {
      alert("Please upload a Poster Image or switch to Video Banner.");
      return;
    }

    if (posterType === "video" && !posterVideo) {
      alert("Please upload a Video File or enter a Video URL.");
      return;
    }

    setLoading(true);
    try {
      await submitAdRequest({
        businessName,
        contactPhone,
        title,
        description,
        targetUrl,
        durationDays: Number(durationDays),
        posterType,
        posterImage: posterType === "image" ? posterImage : "",
        posterVideo: posterType === "video" ? posterVideo : "",
        receiptImage,
      });

      setSubmittedSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error(err);
      alert("Failed to submit advertisement request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedSuccess(false);
    setBusinessName("");
    setContactPhone("");
    setTitle("");
    setDescription("");
    setTargetUrl("");
    setPosterImage("");
    setReceiptImage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5 dark:border-slate-800 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                Promote Your Business
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish featured banners to thousands of Uva travellers.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {submittedSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
                Ad Submitted Successfully!
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Your advertisement request and payment receipt have been sent to the Admin Panel. Once verified by our admin team, your promo banner will go live on the Home page.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-extrabold text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
                <PhoneCall size={16} />
                <span>Admin Hotline: +94 57 222 9999</span>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleReset}
                  className="rounded-2xl bg-teal-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-teal-500"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Call Admin Hotline Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-3">
                  <PhoneCall size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold">Need Quick Ad Approval or Help?</h4>
                    <p className="text-[11px] opacity-90">Call Admin Hotline: +94 57 222 9999</p>
                  </div>
                </div>
                <a
                  href="tel:+94572229999"
                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600 shrink-0"
                >
                  Call Now
                </a>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Ella View Cafe"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Promotion Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🍰 20% Off Fresh Artisan Pastries & Ella Coffee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Promotion Details / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Show your Uva Explorer app at checkout for 20% discount on all artisan breakfast items..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Website / Promo Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Requested Duration
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={7}>7 Days Promo (Standard)</option>
                    <option value={14}>14 Days Promo (Popular)</option>
                    <option value={30}>30 Days Promo (Monthly)</option>
                  </select>
                </div>
              </div>

              {/* File Uploads: Image / Video Banner & Payment Receipt */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {/* Banner Choice (Image or Video) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {posterType === "video" ? <Video size={14} className="text-amber-500" /> : <Image size={14} className="text-teal-600" />}
                      Ad Banner ({posterType === "video" ? "Video" : "Image"}) *
                    </label>

                    {/* Toggle Type */}
                    <div className="flex rounded-lg bg-slate-200 p-0.5 dark:bg-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPosterType("image")}
                        className={`px-2 py-0.5 rounded-md transition ${posterType === "image" ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
                      >
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosterType("video")}
                        className={`px-2 py-0.5 rounded-md transition ${posterType === "video" ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs" : "text-slate-500"}`}
                      >
                        Video
                      </button>
                    </div>
                  </div>

                  {posterType === "image" ? (
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
                      {posterImage ? (
                        <div className="relative h-28 w-full overflow-hidden rounded-xl">
                          <img src={posterImage} alt="Poster" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPosterImage("")}
                            className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-slate-400 mb-1" />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            Upload Ad Image Poster
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFile(e, setPosterImage)}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 text-center dark:border-amber-900/60 dark:bg-amber-950/30">
                        {posterVideo ? (
                          <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-900">
                            <video src={posterVideo} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPosterVideo("")}
                              className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white z-10"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Film size={20} className="text-amber-500 mb-1" />
                            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                              Upload Short Video Ad (MP4/WebM)
                            </span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoFile}
                              className="absolute inset-0 cursor-pointer opacity-0"
                            />
                          </>
                        )}
                      </div>

                      <input
                        type="url"
                        placeholder="Or paste MP4 / video URL link..."
                        value={posterVideo.startsWith("data:") ? "" : posterVideo}
                        onChange={(e) => setPosterVideo(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Payment Receipt */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <CreditCard size={14} className="text-amber-600" />
                    Payment Slip / Receipt
                  </label>
                  <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
                    {receiptImage ? (
                      <div className="relative h-28 w-full overflow-hidden rounded-xl">
                        <img src={receiptImage} alt="Receipt" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReceiptImage("")}
                          className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-slate-400 mb-1" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Upload Payment Receipt
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFile(e, setReceiptImage)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-amber-600 active:scale-98 disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  <span>{loading ? "Submitting..." : "Submit Promo Request"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MerchantAdModal;

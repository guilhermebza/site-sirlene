"use client";

import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  Home,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Pencil,
  Phone,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const WHATSAPP_NUMBER = "5554996411910";
const EMAIL = "sirlene.regina@creci.org.br";
const CITY = "Caxias do Sul e Região";
const CRECI = "087250F";
const BRAND = "Regina Barboza";
const SITE_NAME = "Regina Imóveis";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const PROFILE_IMAGE = "/sirlene.jpeg";

type Property = {
  id: string;
  slug: string;
  purpose: string;
  title: string;
  neighborhood: string;
  city: string;
  type: string;
  price: string;
  condoFee: string;
  iptu: string;
  beds: number;
  baths: number;
  garage: number;
  area: string;
  highlight: string;
  description: string;
  images: string[];
  features: string[];
  mapEmbedUrl: string;
};

type LeadType = "property" | "general";

type Lead = {
  id: string;
  type: LeadType;
  propertyId: string;
  propertyTitle: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
};

type PropertyFormState = {
  id: string;
  slug: string;
  purpose: string;
  title: string;
  neighborhood: string;
  city: string;
  type: string;
  price: string;
  condoFee: string;
  iptu: string;
  beds: number | string;
  baths: number | string;
  garage: number | string;
  area: string;
  highlight: string;
  description: string;
  imagesText: string;
  featuresText: string;
  mapEmbedUrl: string;
};

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function propertyUrl(slug: string) {
  return `#/imovel/${slug}`;
}

function buttonClass(primary = false) {
  return primary
    ? "inline-flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
    : "inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50";
}

function badgeClass(dark = false) {
  return dark
    ? "inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
    : "inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white";
}

function inputClass() {
  return "w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500";
}

function cardClass() {
  return "rounded-[2rem] border border-slate-200 bg-white shadow-sm";
}

function readFilesAsDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

function normalizeProperty(row: any): Property {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    purpose: String(row.purpose ?? "Venda"),
    title: String(row.title ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    city: String(row.city ?? "Caxias do Sul"),
    type: String(row.type ?? "Apartamento"),
    price: String(row.price ?? ""),
    condoFee: String(row.condo_fee ?? ""),
    iptu: String(row.iptu ?? ""),
    beds: Number(row.beds ?? 0),
    baths: Number(row.baths ?? 0),
    garage: Number(row.garage ?? 0),
    area: String(row.area ?? ""),
    highlight: String(row.highlight ?? ""),
    description: String(row.description ?? ""),
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    mapEmbedUrl: String(row.map_embed_url ?? ""),
  };
}

function normalizeLead(row: any): Lead {
  return {
    id: String(row.id ?? ""),
    type: (row.type === "property" ? "property" : "general") as LeadType,
    propertyId: String(row.property_id ?? ""),
    propertyTitle: String(row.property_title ?? ""),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    message: String(row.message ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <div className={`${cardClass()} overflow-hidden`}>
      <div className="relative h-64 bg-slate-100">
        {property.images[0] ? (
          <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Home className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800">
            {property.type}
          </span>
          <span className={badgeClass(property.purpose === "Aluguel")}>{property.purpose}</span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{property.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>
                {property.neighborhood}, {property.city}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-700">{property.price}</div>
            <div className="text-xs text-slate-500">{property.area}</div>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">{property.highlight}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <BedDouble className="h-4 w-4" /> {property.beds || "—"}
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4" /> {property.baths || "—"}
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" /> {property.garage || "—"}
          </div>
        </div>

        <div className="mt-6">
          <a href={propertyUrl(property.slug)} className="block">
            <span className={`${buttonClass(false)} w-full`}>Ver detalhes</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function InterestForm({
  property,
  onSubmitLead,
}: {
  property: Property;
  onSubmitLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}) {
  const [form, setForm] = useState<LeadFormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Preencha pelo menos nome e telefone.");
      setSent(false);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitLead({
        type: "property",
        propertyId: property.id,
        propertyTitle: property.title,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      setForm({ name: "", phone: "", email: "", message: "" });
      setError("");
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Não foi possível enviar agora.");
      setSent(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-2xl font-bold text-slate-900">Tenho interesse neste imóvel</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Preencha seus dados e a Regina poderá entrar em contato com você depois.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome"
            className={inputClass()}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Seu telefone"
            className={inputClass()}
          />
        </div>

        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Seu e-mail (opcional)"
          className={inputClass()}
        />

        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Mensagem opcional"
          className={`${inputClass()} min-h-[120px]`}
        />

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" className={buttonClass(true)} disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar interesse"}
          </button>

          <a
            href={whatsappLink(`Olá, quero agendar uma visita para o imóvel ${property.title}.`)}
            target="_blank"
            rel="noreferrer"
          >
            <span className={buttonClass(false)}>Agendar visita no WhatsApp</span>
          </a>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        {sent ? (
          <p className="text-sm font-medium text-emerald-700">
            Recebemos seu interesse. Em breve entraremos em contato.
          </p>
        ) : null}
      </form>
    </div>
  );
}

function GeneralContactForm({
  onSubmitLead,
}: {
  onSubmitLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}) {
  const [form, setForm] = useState<LeadFormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Preencha pelo menos nome e telefone.");
      setSent(false);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitLead({
        type: "general",
        propertyId: "",
        propertyTitle: "Contato geral",
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      setForm({ name: "", phone: "", email: "", message: "" });
      setError("");
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Não foi possível enviar agora.");
      setSent(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Seu nome"
          className={inputClass()}
        />
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Seu telefone"
          className={inputClass()}
        />
      </div>

      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Seu e-mail (opcional)"
        className={inputClass()}
      />

      <textarea
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Conte um pouco sobre o que você procura ou como gostaria de conversar"
        className={`${inputClass()} min-h-[130px]`}
      />

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button type="submit" className={buttonClass(true)} disabled={submitting}>
          {submitting ? "Enviando..." : "Solicitar atendimento"}
        </button>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {sent ? (
        <p className="text-sm font-medium text-emerald-700">
          Recebemos sua solicitação. Em breve a Regina poderá entrar em contato.
        </p>
      ) : null}
    </form>
  );
}

function PropertyDetailPage({
  property,
  onBack,
  onSubmitLead,
}: {
  property: Property;
  onBack: () => void;
  onSubmitLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}) {
  const [activeImage, setActiveImage] = useState(property.images[0] || "");

  useEffect(() => {
    document.title = `${property.title} | ${SITE_NAME}`;
  }, [property.title]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Voltar
          </button>
          <a
            href={whatsappLink(`Olá, quero informações sobre o imóvel ${property.title}.`)}
            target="_blank"
            rel="noreferrer"
          >
            <span className={buttonClass(true)}>WhatsApp do imóvel</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-sm">
              {activeImage ? (
                <img src={activeImage} alt={property.title} className="h-[460px] w-full object-cover" />
              ) : (
                <div className="flex h-[460px] items-center justify-center text-slate-400">
                  <Home className="h-14 w-14" />
                </div>
              )}
            </div>

            {property.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {property.images.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-2xl border ${
                      activeImage === image ? "border-emerald-600" : "border-slate-200"
                    }`}
                  >
                    <img src={image} alt={`${property.title} ${idx + 1}`} className="h-28 w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            {property.mapEmbedUrl ? (
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm">
                <iframe
                  src={property.mapEmbedUrl}
                  width="100%"
                  height="380"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa do imóvel ${property.title}`}
                />
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className={badgeClass(property.purpose === "Aluguel")}>{property.purpose}</span>
              <span className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800">
                {property.type}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{property.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4" /> {property.neighborhood}, {property.city}
            </div>
            <div className="mt-6 text-3xl font-bold text-emerald-700">{property.price}</div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-[2rem] bg-slate-50 p-5 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4" /> {property.beds || "—"} quartos
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4" /> {property.baths || "—"} banheiros
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" /> {property.garage || "—"} vagas
              </div>
              <div className="flex items-center gap-2">Área: {property.area}</div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              {property.condoFee ? (
                <div>
                  <strong>Condomínio:</strong> {property.condoFee}
                </div>
              ) : null}
              {property.iptu ? (
                <div>
                  <strong>IPTU:</strong> {property.iptu}
                </div>
              ) : null}
            </div>

            <p className="mt-6 leading-8 text-slate-600">{property.description}</p>

            {property.features.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {property.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}

            <InterestForm property={property} onSubmitLead={onSubmitLead} />
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminPanel({
  properties,
  leads,
  onSaveProperty,
  onDeleteProperty,
  onDeleteLead,
  onClose,
}: {
  properties: Property[];
  leads: Lead[];
  onSaveProperty: (property: Property) => Promise<boolean>;
  onDeleteProperty: (id: string) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const emptyForm: PropertyFormState = {
    id: "",
    slug: "",
    purpose: "Venda",
    title: "",
    neighborhood: "",
    city: "Caxias do Sul",
    type: "Apartamento",
    price: "",
    condoFee: "",
    iptu: "",
    beds: 0,
    baths: 0,
    garage: 0,
    area: "",
    highlight: "",
    description: "",
    imagesText: "",
    featuresText: "",
    mapEmbedUrl: "",
  };

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormState>(emptyForm);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"imoveis" | "interessados">("imoveis");
  const [saving, setSaving] = useState(false);

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setUploadedImages(property.images.filter((img) => img.startsWith("data:image")));
    setForm({
      id: property.id,
      slug: property.slug,
      purpose: property.purpose,
      title: property.title,
      neighborhood: property.neighborhood,
      city: property.city,
      type: property.type,
      price: property.price,
      condoFee: property.condoFee,
      iptu: property.iptu,
      beds: property.beds,
      baths: property.baths,
      garage: property.garage,
      area: property.area,
      highlight: property.highlight,
      description: property.description,
      imagesText: property.images.filter((img) => !img.startsWith("data:image")).join("\n"),
      featuresText: property.features.join(", "),
      mapEmbedUrl: property.mapEmbedUrl,
    });
    setActiveTab("imoveis");
  };

  const resetForm = () => {
    setEditingId(null);
    setUploadedImages([]);
    setForm(emptyForm);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const dataUrls = await readFilesAsDataUrls(files);
    setUploadedImages((current) => [...current, ...dataUrls]);
    e.target.value = "";
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((current) => current.filter((_, i) => i !== index));
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = form.title.trim();
    const slug = form.slug.trim() || slugify(title);

    if (!title) {
      alert("Preencha o título do imóvel.");
      return;
    }

    const urlImages = form.imagesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const features = form.featuresText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSaving(true);
    const ok = await onSaveProperty({
      id: editingId || crypto.randomUUID(),
      slug,
      purpose: form.purpose.trim() || "Venda",
      title,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      type: form.type.trim(),
      price: form.price.trim(),
      condoFee: form.condoFee.trim(),
      iptu: form.iptu.trim(),
      beds: Number(form.beds || 0),
      baths: Number(form.baths || 0),
      garage: Number(form.garage || 0),
      area: form.area.trim(),
      highlight: form.highlight.trim(),
      description: form.description.trim(),
      images: [...uploadedImages, ...urlImages],
      features,
      mapEmbedUrl: form.mapEmbedUrl.trim(),
    });
    setSaving(false);

    if (ok) {
      resetForm();
    } else {
      alert("Não foi possível salvar o imóvel. Veja o erro no console do navegador.");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-slate-300">Área restrita</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha do painel"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400"
            />

            <div className="flex gap-3">
              <button
                className={`${buttonClass(true)} flex-1 border-0`}
                onClick={() => {
                  if (password === ADMIN_PASSWORD) {
                    setAuthenticated(true);
                    setLoginError("");
                  } else {
                    setLoginError("Senha incorreta.");
                  }
                }}
              >
                Entrar
              </button>

              <button className={buttonClass(false)} onClick={onClose}>
                Voltar
              </button>
            </div>

            {loginError ? <p className="text-sm text-red-300">{loginError}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-sm text-slate-500">Painel simples</div>
            <h1 className="text-2xl font-bold">Gestão da corretora</h1>
          </div>

          <div className="flex gap-3">
            <button className={buttonClass(false)} onClick={resetForm}>
              Novo cadastro
            </button>
            <button className={buttonClass(true)} onClick={onClose}>
              Ver site público
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className={activeTab === "imoveis" ? buttonClass(true) : buttonClass(false)}
            onClick={() => setActiveTab("imoveis")}
          >
            Imóveis
          </button>
          <button
            className={activeTab === "interessados" ? buttonClass(true) : buttonClass(false)}
            onClick={() => setActiveTab("interessados")}
          >
            <Users className="mr-2 h-4 w-4" />
            Interessados ({leads.length})
          </button>
        </div>

        {activeTab === "imoveis" ? (
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className={`${cardClass()} p-6`}>
              <h2 className="mb-5 text-2xl font-bold">{editingId ? "Editar imóvel" : "Cadastrar imóvel"}</h2>

              <form className="grid gap-4" onSubmit={submitForm}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Título do imóvel"
                    className={inputClass()}
                  />
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="Slug (opcional)"
                    className={inputClass()}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    className={inputClass()}
                  />
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Cidade"
                    className={inputClass()}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="Venda ou Aluguel"
                    className={inputClass()}
                  />
                  <input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Tipo"
                    className={inputClass()}
                  />
                  <input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Preço"
                    className={inputClass()}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    value={form.beds}
                    onChange={(e) => setForm({ ...form, beds: e.target.value })}
                    placeholder="Quartos"
                    className={inputClass()}
                  />
                  <input
                    value={form.baths}
                    onChange={(e) => setForm({ ...form, baths: e.target.value })}
                    placeholder="Banheiros"
                    className={inputClass()}
                  />
                  <input
                    value={form.garage}
                    onChange={(e) => setForm({ ...form, garage: e.target.value })}
                    placeholder="Vagas"
                    className={inputClass()}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="Área"
                    className={inputClass()}
                  />
                  <input
                    value={form.condoFee}
                    onChange={(e) => setForm({ ...form, condoFee: e.target.value })}
                    placeholder="Condomínio"
                    className={inputClass()}
                  />
                  <input
                    value={form.iptu}
                    onChange={(e) => setForm({ ...form, iptu: e.target.value })}
                    placeholder="IPTU"
                    className={inputClass()}
                  />
                </div>

                <input
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  placeholder="Frase de destaque"
                  className={inputClass()}
                />

                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição do imóvel"
                  className={`${inputClass()} min-h-[120px]`}
                />

                <textarea
                  value={form.imagesText}
                  onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                  placeholder="Links de fotos, um por linha"
                  className={`${inputClass()} min-h-[120px]`}
                />

                <div className="rounded-[2rem] border border-dashed border-slate-300 p-4">
                  <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                    <Upload className="h-4 w-4" />
                    Enviar fotos do computador
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>

                  {uploadedImages.length > 0 ? (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {uploadedImages.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200">
                          <img src={image} alt={`Upload ${index + 1}`} className="h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <textarea
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="Diferenciais separados por vírgula"
                  className={`${inputClass()} min-h-[100px]`}
                />

                <textarea
                  value={form.mapEmbedUrl}
                  onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
                  placeholder="Cole aqui a URL de incorporação do Google Maps"
                  className={`${inputClass()} min-h-[100px]`}
                />

                <div className="flex gap-3">
                  <button type="submit" className={buttonClass(true)} disabled={saving}>
                    {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar imóvel"}
                  </button>
                  <button type="button" className={buttonClass(false)} onClick={resetForm}>
                    Limpar
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {properties.length === 0 ? (
                <div className={`${cardClass()} p-8 text-center text-slate-500`}>
                  Nenhum imóvel cadastrado ainda.
                </div>
              ) : null}

              {properties.map((property) => (
                <div key={property.id} className={`${cardClass()} p-5`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {property.images[0] ? (
                        <img src={property.images[0]} alt={property.title} className="h-24 w-28 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-24 w-28 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Home className="h-8 w-8" />
                        </div>
                      )}

                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className={badgeClass(property.purpose === "Aluguel")}>{property.purpose}</span>
                          <span className="inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800">
                            {property.type}
                          </span>
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{property.title}</h3>
                        <p className="text-sm text-slate-500">
                          {property.neighborhood}, {property.city} • {property.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className={buttonClass(false)} onClick={() => handleEdit(property)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </button>

                      <button
                        className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                        onClick={() => void onDeleteProperty(property.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className={`${cardClass()} p-8 text-center text-slate-500`}>
                Nenhum interessado recebido ainda.
              </div>
            ) : null}

            {leads.map((lead) => (
              <div key={lead.id} className={`${cardClass()} p-6`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2">
                      <span className={lead.type === "property" ? badgeClass(false) : badgeClass(true)}>
                        {lead.type === "property" ? "Interesse em imóvel" : "Contato geral"}
                      </span>
                    </div>

                    <div className="text-sm text-slate-500">Origem</div>
                    <h3 className="text-xl font-bold text-slate-900">{lead.propertyTitle}</h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-sm text-slate-500">Nome</div>
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                      </div>

                      <div>
                        <div className="text-sm text-slate-500">Telefone</div>
                        <div className="font-semibold text-slate-900">{lead.phone}</div>
                      </div>

                      <div>
                        <div className="text-sm text-slate-500">E-mail</div>
                        <div className="font-semibold text-slate-900">{lead.email || "Não informado"}</div>
                      </div>

                      <div>
                        <div className="text-sm text-slate-500">Recebido em</div>
                        <div className="font-semibold text-slate-900">
                          {new Date(lead.createdAt).toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>

                    {lead.message ? (
                      <div className="mt-4">
                        <div className="text-sm text-slate-500">Mensagem</div>
                        <p className="mt-1 leading-7 text-slate-700">{lead.message}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={whatsappLink(
                        `Olá ${lead.name}, aqui é a Regina. Recebi seu ${
                          lead.type === "property" ? `interesse no imóvel ${lead.propertyTitle}` : "contato pelo site"
                        }.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className={buttonClass(true)}>Chamar no WhatsApp</span>
                    </a>

                    <button
                      className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                      onClick={() => void onDeleteLead(lead.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PublicSite({
  properties,
  goToAdmin,
  onSubmitLead,
}: {
  properties: Property[];
  goToAdmin: () => void;
  onSubmitLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todas");
  const [typeFilter, setTypeFilter] = useState("Todos");

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();

    return properties.filter((item) => {
      const matchesTerm =
        !term ||
        [item.title, item.neighborhood, item.city, item.type, item.highlight, item.purpose]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesPurpose = purposeFilter === "Todos" || item.purpose === purposeFilter;
      const matchesCity = cityFilter === "Todas" || item.city === cityFilter;
      const matchesType = typeFilter === "Todos" || item.type === typeFilter;

      return matchesTerm && matchesPurpose && matchesCity && matchesType;
    });
  }, [properties, search, purposeFilter, cityFilter, typeFilter]);

  useEffect(() => {
    document.title = `${SITE_NAME} | ${BRAND}`;
  }, []);

  const uniqueCities = ["Todas", ...Array.from(new Set(properties.map((p) => p.city).filter(Boolean)))];
  const uniqueTypes = ["Todos", ...Array.from(new Set(properties.map((p) => p.type).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Corretora de imóveis</div>
              <div className="text-lg font-bold tracking-tight">{BRAND}</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#imoveis" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Imóveis
            </a>
            <a href="#servicos" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Serviços
            </a>
            <a href="#contato" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Contato
            </a>
            <a href="#sobre" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sobre
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </nav>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4">
              <a href="#imoveis" className="rounded-xl px-2 py-2 text-slate-700">Imóveis</a>
              <a href="#servicos" className="rounded-xl px-2 py-2 text-slate-700">Serviços</a>
              <a href="#contato" className="rounded-xl px-2 py-2 text-slate-700">Contato</a>
              <a href="#sobre" className="rounded-xl px-2 py-2 text-slate-700">Sobre</a>
              <a href="#faq" className="rounded-xl px-2 py-2 text-slate-700">FAQ</a>
            </div>
          </div>
        ) : null}
      </header>

      <main id="top">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_left,rgba(2,6,23,0.05),transparent_35%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="relative z-10">
              <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Compra, venda e aluguel com atendimento humano e profissional
              </span>

              <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Encontre o imóvel certo com atendimento de verdade.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                {BRAND} atua com foco em <strong>venda e aluguel de imóveis</strong> em <strong>{CITY}</strong>,
                com uma abordagem próxima, elegante e orientada a resultado.
              </p>

              <div className="mt-8">
                <a href="#imoveis">
                  <span className={buttonClass(false)}>Ver imóveis</span>
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Atendimento", value: "Ágil e próximo" },
                  { label: "Atuação", value: CITY },
                  { label: "Registro", value: CRECI },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-slate-500">{item.label}</div>
                    <div className="mt-1 font-semibold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={PROFILE_IMAGE}
                    alt={BRAND}
                    className="h-64 w-64 rounded-full object-cover shadow-lg ring-4 ring-emerald-50"
                  />
                  <h2 className="mt-6 text-2xl font-bold text-slate-900">{BRAND}</h2>
                  <p className="mt-2 text-slate-600">Corretora de imóveis • {CRECI}</p>
                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                    Atendimento elegante, próximo e profissional para quem quer comprar, vender ou alugar com mais confiança.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="imoveis" className="mx-auto max-w-7xl px-4 py-20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Imóveis</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Filtre aqui e encontre seu imóvel ideal
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">Filtre por cidade, bairro e necessidade.</p>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por bairro, cidade, tipo ou finalidade"
                  className={`${inputClass()} pl-11`}
                />
              </div>

              <div className="flex gap-3">
                {["Todos", "Venda", "Aluguel"].map((value) => (
                  <button
                    key={value}
                    className={purposeFilter === value ? buttonClass(true) : buttonClass(false)}
                    onClick={() => setPurposeFilter(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={inputClass()}>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city === "Todas" ? "Todas as cidades" : city}
                    </option>
                  ))}
                </select>

                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputClass()}>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "Todos" ? "Todos os tipos" : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              Nenhum imóvel publicado no momento.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        <section id="servicos" className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Serviços</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Um site completo, para lhe fornecer as melhores opções de imóveis disponíveis em Caxias do Sul e região.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                O site foi desenvolvido para organizar os imóveis e transformar as suas visitas em oportunidades reais.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: "Compra e venda", text: "Apresentação estratégica de imóveis e atendimento direto entre comprador/locador e vendedor." },
                { title: "Aluguéis", text: "Estrutura preparada para locação com detalhes completos" },
                { title: "Captação de interessados", text: "Deixe seu contato conosco sem compromisso, entraremos em contato!" },
                { title: "Presença profissional", text: "Atendimento humano, para te fazer se sentir realmente em casa." },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Contato</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Solicite atendimento</h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Ainda não encontrou o imóvel certo ou quer conversar antes? Deixe seus dados e a Regina pode falar com você depois.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">WhatsApp</div>
                    <a
                      href={whatsappLink("Olá, quero atendimento imobiliário.")}
                      className="font-semibold text-slate-900"
                      target="_blank"
                      rel="noreferrer"
                    >
                      +55 54 99641-1910
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">E-mail</div>
                    <a href={`mailto:${EMAIL}`} className="font-semibold text-slate-900">{EMAIL}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Região de atendimento</div>
                    <div className="font-semibold text-slate-900">{CITY}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardClass()} p-6 sm:p-8`}>
              <div className="mb-6">
                <div className="text-sm font-medium text-slate-500">Quero conversar</div>
                <h3 className="text-2xl font-bold text-slate-900">Deixe seus dados para retorno</h3>
              </div>

              <GeneralContactForm onSubmitLead={onSubmitLead} />
            </div>
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Sobre a corretora</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Presença elegante, confiável e pronta para crescer
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Regina Barboza é uma profissional acessível, organizada e preparada para transformar visitas em oportunidades reais.
              </p>

              <div className="mt-8 space-y-5 text-slate-600">
                <p>
                  A proposta aqui foi criar uma experiência séria, atual e comercialmente eficiente, com foco em clareza, confiança e conversão.
                </p>
                <p>
                  O site foi pensado para atendimento orgânico, painel intuitivo, captação de clientes e apresentação profissional dos imóveis.
                </p>
              </div>
            </div>

            <div className={`${cardClass()} p-6`}>
              <h3 className="text-2xl font-bold">Diferenciais do projeto</h3>
              <div className="mt-5 space-y-4">
                {[
                  "Design premium e responsivo",
                  "Compra e aluguel no mesmo site",
                  "Páginas próprias por imóvel",
                  "Captação de interessados pelo próprio site",
                  "Contato geral para quem ainda quer conversar",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Prova social</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Uma apresentação que transmite confiança desde o primeiro olhar
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                "Atendimento claro, próximo e muito profissional do início ao fim.",
                "A experiência foi tranquila e segura. Sentimos confiança em cada etapa.",
                "Agilidade, boa comunicação e visão comercial. Recomendo fortemente.",
              ].map((text, idx) => (
                <div key={idx} className={`${cardClass()} p-6`}>
                  <div className="flex gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-slate-600">“{text}”</p>
                  <div className="mt-6 font-semibold text-slate-900">Cliente satisfeito</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">FAQ</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Perguntas frequentes</h2>

            <div className="mt-10 space-y-4">
              {[
                {
                  q: "Você trabalha com venda e aluguel?",
                  a: "Sim. Trabalhamos com vendas e alugueis, tendo foco principal no cliente e seus interesses individuais.",
                },
                {
                  q: "Como funciona o interesse no imóvel?",
                  a: "O visitante pode deixar nome, telefone e mensagem. Depois a corretora visualiza isso no painel e entra em contato.",
                },
                {
                  q: "E se eu só quiser conversar?",
                  a: "Também é possível deixar um contato geral na seção Solicite atendimento, sem estar ligado a um imóvel específico.",
                },
              ].map((item) => (
                <div key={item.q} className={`${cardClass()} p-6`}>
                  <h3 className="text-lg font-semibold text-slate-900">{item.q}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-600 p-8 text-white shadow-2xl md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Pronto para crescer</div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Um site com cara de marca séria, pronto para receber tráfego e gerar contatos.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a href="#imoveis">
                  <span className={`${buttonClass(false)} border-0 bg-white text-emerald-700 hover:bg-emerald-50`}>
                    Ver imóveis
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <a
        href={whatsappLink("Olá, vim pelo site e quero atendimento imobiliário.")}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-xl transition hover:bg-emerald-700">
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </span>
      </a>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="text-lg font-bold">{SITE_NAME}</div>
            <p className="mt-3 text-sm text-slate-500">
              Site desenvolvido por <strong>Guilherme Barboza</strong> • Desenvolvimento Web
            </p>
            <div className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Site institucional e comercial de {BRAND}, desenvolvido para gerar autoridade, confiança e oportunidades de negócio no mercado imobiliário.
            </div>
            <div className="mt-4 text-sm text-slate-500">
              {CRECI} • {CITY}
            </div>
          </div>

          <div className="grid gap-2 text-sm text-slate-600">
            <a href="#imoveis" className="hover:text-slate-900">Imóveis</a>
            <a href="#servicos" className="hover:text-slate-900">Serviços</a>
            <a href="#contato" className="hover:text-slate-900">Contato</a>
            <a href="#sobre" className="hover:text-slate-900">Sobre</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SirleneImoveisSite() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const propertiesResponse = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (propertiesResponse.error) {
        console.error("Erro ao buscar imóveis:", propertiesResponse.error);
      } else {
        setProperties((propertiesResponse.data || []).map(normalizeProperty));
      }

      const leadsResponse = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsResponse.error) {
        console.error("Erro ao buscar leads:", leadsResponse.error);
      } else {
        setLeads((leadsResponse.data || []).map(normalizeLead));
      }

      setLoading(false);
    };

    void loadData();
  }, []);

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash || "");
    updateRoute();
    window.addEventListener("hashchange", updateRoute);

    return () => {
      window.removeEventListener("hashchange", updateRoute);
    };
  }, []);

  useEffect(() => {
    let buffer = "";

    const handleKey = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();

      if (buffer.length > 5) {
        buffer = buffer.slice(-5);
      }

      if (buffer === "admin") {
        window.location.hash = "/painel";
        buffer = "";
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  const propertyMatch = route.match(/^#\/imovel\/(.+)$/);
  const panelMatch = route.startsWith("#/painel");
  const property = propertyMatch ? properties.find((item) => item.slug === propertyMatch[1]) : null;

  const goHome = () => {
    window.location.hash = "";
  };

  const saveProperty = async (incomingProperty: Property): Promise<boolean> => {
    const payload = {
      id: incomingProperty.id,
      slug: incomingProperty.slug,
      purpose: incomingProperty.purpose,
      title: incomingProperty.title,
      neighborhood: incomingProperty.neighborhood,
      city: incomingProperty.city,
      type: incomingProperty.type,
      price: incomingProperty.price,
      condo_fee: incomingProperty.condoFee,
      iptu: incomingProperty.iptu,
      beds: incomingProperty.beds,
      baths: incomingProperty.baths,
      garage: incomingProperty.garage,
      area: incomingProperty.area,
      highlight: incomingProperty.highlight,
      description: incomingProperty.description,
      images: incomingProperty.images,
      features: incomingProperty.features,
      map_embed_url: incomingProperty.mapEmbedUrl,
    };

    const response = await supabase
      .from("properties")
      .upsert(payload)
      .select()
      .single();

    if (response.error) {
      console.error("Erro ao salvar imóvel:", JSON.stringify(response.error, null, 2));
      return false;
    }

    const normalized = normalizeProperty(response.data);

    setProperties((current) => {
      const exists = current.some((item) => item.id === normalized.id);
      if (exists) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      return [normalized, ...current];
    });

    return true;
  };

  const deleteProperty = async (id: string): Promise<void> => {
    const response = await supabase.from("properties").delete().eq("id", id);

    if (response.error) {
      console.error("Erro ao excluir imóvel:", response.error);
      return;
    }

    setProperties((current) => current.filter((item) => item.id !== id));
    setLeads((current) => current.filter((item) => item.propertyId !== id));
  };

  const addLead = async (incomingLead: Omit<Lead, "id" | "createdAt">): Promise<void> => {
    const payload = {
      type: incomingLead.type,
      property_id: incomingLead.propertyId || null,
      property_title: incomingLead.propertyTitle,
      name: incomingLead.name,
      phone: incomingLead.phone,
      email: incomingLead.email,
      message: incomingLead.message,
    };

    const response = await supabase
      .from("leads")
      .insert(payload)
      .select()
      .single();

    if (response.error) {
      console.error("Erro ao salvar lead:", response.error);
      throw response.error;
    }

    setLeads((current) => [normalizeLead(response.data), ...current]);
  };

  const deleteLead = async (id: string): Promise<void> => {
    const response = await supabase.from("leads").delete().eq("id", id);

    if (response.error) {
      console.error("Erro ao excluir lead:", response.error);
      return;
    }

    setLeads((current) => current.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">
        Carregando...
      </div>
    );
  }

  if (panelMatch) {
    return (
      <AdminPanel
        properties={properties}
        leads={leads}
        onSaveProperty={saveProperty}
        onDeleteProperty={deleteProperty}
        onDeleteLead={deleteLead}
        onClose={goHome}
      />
    );
  }

  if (property) {
    return <PropertyDetailPage property={property} onBack={goHome} onSubmitLead={addLead} />;
  }

  return <PublicSite properties={properties} goToAdmin={() => {}} onSubmitLead={addLead} />;
}
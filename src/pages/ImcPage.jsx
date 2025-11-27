import { useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_USER_PROFILE = "vd_user_profile";

function calcularIMC(peso, estaturaCm) {
  const estaturaM = estaturaCm / 100;
  return peso / (estaturaM * estaturaM);
}

function clasificarIMC(imc) {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
}

export default function ImcPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    sexo: "Femenino",
    peso: "",
    estatura: "",
    objetivo: "Bajar grasa",
    needs: {
      detox: false,
      libido: false,
      fatLoss: false,
      appetite: false,
      menopause: false,
      cycle: false,
      glucose: false,
      cholesterol: false,
      vitamins: false,
      antiinflamatorio: false,
      pressure: false,
      stress: false,
      memory: false,
      skin: false,
    },
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleNeedChange(e) {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      needs: {
        ...prev.needs,
        [name]: checked,
      },
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const peso = parseFloat(form.peso);
    const estatura = parseFloat(form.estatura);

    if (!peso || !estatura) {
      setError("Por favor ingresa un peso y estatura válidos.");
      return;
    }

    const imc = calcularIMC(peso, estatura);
    const clasificacion = clasificarIMC(imc);

    const perfil = {
      nombre: form.nombre,
      edad: form.edad ? Number(form.edad) : null,
      sexo: form.sexo,
      peso,
      estatura,
      imc: Number(imc.toFixed(1)),
      clasificacion_imc: clasificacion,
      objetivo: form.objetivo,
      needs: form.needs,
    };

    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(perfil));
    navigate("/catalogo");
  }

  const n = form.needs;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-bold text-emerald-700">Calcula tu IMC</h1>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">

          <div>
            <label className="block text-gray-600 mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border border-emerald-200 rounded-xl px-3 py-2"
              placeholder="Ej. María"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">Peso (kg)</label>
              <input
                name="peso"
                type="number"
                value={form.peso}
                onChange={handleChange}
                required
                className="w-full border border-emerald-200 rounded-xl px-3 py-2"
                placeholder="Ej. 68"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Estatura (cm)</label>
              <input
                name="estatura"
                type="number"
                value={form.estatura}
                onChange={handleChange}
                required
                className="w-full border border-emerald-200 rounded-xl px-3 py-2"
                placeholder="Ej. 160"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow"
          >
            Ver mis productos recomendados
          </button>

        </form>
      </div>
    </div>
  );
}

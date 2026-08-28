/**
 * Registro de veiculos da garagem.
 *
 * `model` aceita um caminho para .glb/.gltf servido de /public (ex.:
 * "/models/batmobile-2022.glb"). Enquanto for `null`, a garagem renderiza o
 * substituto procedural — nenhuma outra parte do codigo precisa mudar quando
 * os modelos finais chegarem.
 *
 * `transform` e aplicado ao <primitive> do GLTF para normalizar escala e
 * assentamento no chao sem reexportar o asset.
 */
export const VEHICLES = [
  {
    id: "vengeance",
    name: "Vengeance",
    year: "2022",
    tag: "Muscle blindado",
    model: "/models/vengeance.glb",
    accent: "#e11021",
    transform: { scale: 0.809, position: [0, 0.082, 0], rotation: [0, 0, 0] },
    specs: [
      ["Motor", "V8 sobrealimentado"],
      ["Potência", "1.100 cv"],
      ["Blindagem", "Nível IV"],
      ["0–100", "2,9 s"],
    ],
  },
  {
    id: "tumbler",
    name: "Tumbler",
    year: "2005",
    tag: "Chassi tático",
    model: "/models/tumbler.glb",
    accent: "#f2b53c",
    transform: { scale: 0.181, position: [0, 0.14, 0], rotation: [0, -Math.PI / 2, 0] },
    specs: [
      ["Motor", "Turbina a jato"],
      ["Potência", "Não catalogada"],
      ["Blindagem", "Composto militar"],
      ["0–100", "5,6 s"],
    ],
  },
  {
    id: "wraith",
    name: "Wraith",
    year: "Protótipo",
    tag: "Perfil furtivo",
    model: "/models/wraith.glb",
    accent: "#7ea8ff",
    transform: { scale: 0.0226, position: [0, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    specs: [
      ["Motor", "Elétrico duplo"],
      ["Potência", "940 cv"],
      ["Blindagem", "Camada absorvente"],
      ["0–100", "2,4 s"],
    ],
  },
  {
    id: "brawler",
    name: "Brawler",
    year: "2022",
    tag: "V8 artesanal",
    model: "/models/thebatman.glb",
    accent: "#ff6a1a",
    transform: { scale: 0.487, position: [0, 0.7, 0], rotation: [0, -Math.PI / 2, 0] },
    specs: [
      ["Motor", "V8 5.7L aspirado"],
      ["Potência", "850 cv"],
      ["Blindagem", "Chassi reforçado"],
      ["0–100", "3,4 s"],
    ],
  },
];

export const DEFAULT_VEHICLE_ID = VEHICLES[0].id;

import { Operator } from "@/types";

// Logo untuk operator seluler
export const operatorLogos: Record<Operator, string> = {
  Telkomsel: "/logos/telkomsel.png",
  Indosat: "/logos/indosat.png",
  XL: "/logos/xl.png",
  Tri: "/logos/tri.png",
  Smartfren: "/logos/smartfren.png",
  Axis: "/logos/axis.png",
};

// Prefix nomor HP → deteksi operator
export const operatorPrefixes: Record<Operator, string[]> = {
  Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0852", "0853", "0823"],
  Indosat: ["0855", "0856", "0857", "0858", "0814", "0815", "0816"],
  XL: ["0817", "0818", "0819", "0859", "0877", "0878"],
  Tri: ["0895", "0896", "0897", "0898", "0899"],
  Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887"],
  Axis: ["0831", "0832", "0833", "0838"],
};

// Brand map → filter Digiflazz
export const operatorBrandMap: Record<Operator, string[]> = {
  Telkomsel: ["telkomsel", "tsel", "telkomsel prepaid"],
  Indosat: ["indosat", "isat"],
  XL: ["xl", "xl axiata"],
  Tri: ["tri", "3"],
  Smartfren: ["smartfren"],
  Axis: ["axis"],
};

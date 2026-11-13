# elokuva-vahti-woh1
Web ohjelmointi 1 kurssi loppuprojekti

React applikaatio tulevien elokuvajulkaisuiden selaamista, etsimistä ja seuraamista varten.

## Ominaisuudet
- **Tulevat elokuvat:** Selaa tulevia elokuvajulkaisuja kronologisessa järjestyksessä.
- **Elokuvahaku:** Suodata tulevia elokuvajulkaisuja nimen ja/tai genren mukaan.
- **Seuranta:** Tallenna elokuvia seurattujen listalle. Käyttää localStoragea.

## Teknologiat

- **React & Vite**
- **React Router**
- **Bootstrap** - UI
- **Lucide React** - UI
- **React Intersection Observer** – Loputon skrollaus
- **TMDB API** – Rest API elokuvien tiedoille

## Asennus ja suorittaminen
Esiehtona on **Node.js** (versio 18 tai uudempi) ja **npm** asennettuna.

1. Kloonaa tämä repositorio ja siirry kansioon
2. Aja komento ```npm install```
3. Aseta API-avain luomalla juurihakemistoon ```.env``` tiedosto ja syötä sinne rivi ```VITE_TMDB_API_KEY=api_avaimesi```
4. Käynnistä paikallinen kehityspalvelin komennolla ```npm run dev```
5. Avaa sovellus selaimessa. Oletusosoite: http://localhost:5173/elokuva-vahti-woh1/
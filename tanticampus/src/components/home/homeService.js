// components/home/homeService.js
export const fetchHomeData = async (userId) => {
  try {
    const response = await fetch(`/api/home/${userId}`);
    if (!response.ok) throw new Error("Erreur lors de la récupération des données");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

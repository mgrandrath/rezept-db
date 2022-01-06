import axios from "axios";
import { useQuery } from "react-query";

export const useRecipes = () => {
  return useQuery("recipes", async () => {
    const response = await axios({
      method: "get",
      url: "/api/recipes",
    });

    return response.data.recipes;
  });
};

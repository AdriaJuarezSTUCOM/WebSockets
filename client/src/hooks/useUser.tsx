import axios from 'axios';

export default function useUser(setUser: any) {
  async function Login(email: string) {
    try {
      // Llamada al backend con la petición
      const response = await axios.post("http://localhost:4000/api/login", { email });

      if (response.data.success) {
        // Se construye el objeto user con la información del backend
        const user = { id: response.data.userId, email, name: response.data.userName };
        // Se setean los datos del usuario con los devueltos del backend
        setUser(user);
        return user;
      } else {
        console.log("Error:", response.data.error);
        return null;
      }
    } catch (error) {
      console.error("Error al hacer login:", error);
      return null;
    }
  }

  return Login;
}

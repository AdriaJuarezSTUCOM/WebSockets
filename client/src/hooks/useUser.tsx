import axios from 'axios';

export default function useUser(setUser:any) {
  async function Login(email: string) {
    try {
      const response = await axios.post("http://localhost:4000/api/login", { email });

      console.log("DATA", response.data);

      if (response.data.success) {
        console.log("Usuario encontrado:", response.data.usuario);
        setUser(response.data.usuario);
      } else {
        console.log("Error:", response.data.error);
        return false;
      }
    } catch (error) {
      console.error("Error al hacer login:", error);
      return false;
    }
  }

  return Login;
}

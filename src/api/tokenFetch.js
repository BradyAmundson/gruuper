export const generateToken = async () => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", process.env.REACT_APP_API_KEY);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const response = await fetch(
      "https://smartmatch-zj2w.onrender.com/generate_token",
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();

    return result;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
};

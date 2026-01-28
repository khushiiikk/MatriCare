
try {
    const response = await fetch("http://localhost:5000/");
    const data = await response.json();
    console.log("Backend response:", data);
} catch (error) {
    console.error("Fetch error:", error.message);
}

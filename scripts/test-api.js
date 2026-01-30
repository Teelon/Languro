
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/languages');
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
})();

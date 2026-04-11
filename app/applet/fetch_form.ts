async function fetchForm() {
  const res = await fetch('https://docs.google.com/forms/d/e/1FAIpQLSep4_L5osqkU4oqzZWU2MR0LsbNpZsmzqQekv2tMGwLFch_lQ/viewform');
  const data = await res.text();
  const fbDataMatch = data.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);\n/s);
  if (fbDataMatch) {
      const parsed = JSON.parse(fbDataMatch[1]);
      const fields = parsed[1][1];
      fields.forEach(f => {
          console.log(`Field: ${f[1]}, ID: ${f[4][0][0]}`);
      });
  }
}
fetchForm();

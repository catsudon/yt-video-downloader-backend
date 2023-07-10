const backendIPAddress = "18.142.158.153:8000/download"

document.querySelectorAll(".button")[0].addEventListener("click", function () {
    const options = {
        method: "GET",
        credentials: "include",
    };

    let url = document.getElementById("url").value;
    let start = document.getElementById("start").value;
    let stop = document.getElementById("stop").value;
    
    if(start == "" || stop == "" || Number(start) > Number(stop)) alert("invalid input")
    else window.open(`http://${backendIPAddress}/?url=${url}&start=${start}&stop=${stop}`);
    
});

function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
}

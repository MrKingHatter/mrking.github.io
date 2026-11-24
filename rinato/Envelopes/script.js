window.onload = () => {
    document.getElementById("envelope").addEventListener("click", toggleEnvelope);
    document.getElementById("paper").addEventListener("click", reveal);
}

function toggleEnvelope() {
    let flap = document.getElementById("flap");
    flap.classList.toggle("closed");
    flap.classList.toggle("open");
}

function reveal(event) {
    event.stopPropagation();

    let paper = document.getElementById("paper");
    let opening = document.getElementById("opening");

    if (paper.classList.contains("hidden")) {
        opening.removeChild(paper);
        document.body.appendChild(paper);
    } else {
        document.body.removeChild(paper);
        opening.appendChild(paper);
    }

    paper.classList.toggle("hidden");
    paper.classList.toggle("reveal");
}
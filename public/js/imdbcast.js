


const cform = document.querySelector("cform")
cform.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(cform.elements.cst.value)
})

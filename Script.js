
let nameInput = document.getElementById("name");
let priceInput = document.getElementById("price");
let imgInput = document.getElementById("img");
let descInput = document.getElementById("description");

let addBtn = document.getElementById("add-prod-btn");
let editBtn = document.getElementById("edit-btn");
let deleteBtn = document.getElementById("delete-btn");
let viewBtn = document.getElementById("view-btn");

const vName = document.getElementById("validate_product_name");
const vPrice = document.getElementById("validate_product_price");
const vImage = document.getElementById("validate_product_image");
const vDesc = document.getElementById("validate_product_desc");

var addProductHTML = document.querySelector('.update-product').innerHTML;

let searchInput = document.getElementById("searchInput");
let sortInput = document.getElementById("sortSelect");

let editMode = false;
let editId = null;

function getProducts() {
    let products = [];

    try {
        const stored = localStorage.getItem("products");
        products = stored ? JSON.parse(stored) : [];
    } catch (e) {
        products = [];
    }

    return products;
}

function escapeHtmlAttribute(value){
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

let products = getProducts();
console.log(products);

function renderProducts(products = []) {

    const product_list = Array.isArray(products) ? products : [];
    const productList = document.getElementById("product-list");

    if (product_list.length === 0) {
        productList.innerHTML =
            `<p class="text-center text-muted">No products found</p>`;
        return;
    }

    productList.innerHTML = "";

    product_list.forEach(product => {
        productList.innerHTML += `
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="card product-card h-100 shadow-sm" style="width: 18rem">
                    <img src="${product.image}" class="card-img-top" height="250">
                    <div class="card-body">
                        <h5>${product.productName}</h5>
                        <p class="fw-bold text-success">₹ ${product.price}</p>
                        <p class="small">${product.description}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-outline-primary btn-sm"
                            onclick="viewProduct('${product.productId}')">View</button>
                        <button class="btn btn-outline-success btn-sm"
                            onclick="editProduct('${product.productId}')">Edit</button>
                        <button class="btn btn-outline-danger btn-sm"
                            onclick="deleteProduct('${product.productId}')">Delete</button>
                    </div>
                </div>
            </div>`;
    });
}


function addToLocalStorage(products) {
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts(products);
}

function addProduct() {

    let hasError = false;

    const productName = nameInput.value.trim();
    const price = priceInput.value.trim();
    const image = imgInput.files[0];
    const description = descInput.value.trim();

    if (!productName) {
        showError(nameInput, vName, "Product name is required");
        hasError = true;
    } else {
        showSuccess(nameInput, vName);
    }

    if (!price || price <= 0) {
        showError(priceInput, vPrice, "Price must be greater than 0");
        hasError = true;
    } else {
        showSuccess(priceInput, vPrice);
    }

    if (!image) {
        showError(imgInput, vImage, "Image is required");
        hasError = true;
    } else if (image.size > 200 * 1024) {
        showError(imgInput, vImage, "Image must be under 200 KB");
        hasError = true;
    } else {
        showSuccess(imgInput, vImage);
    }

    if (!description) {
        showError(descInput, vDesc, "Description is required");
        hasError = true;
    } else {
        showSuccess(descInput, vDesc);
    }

    if (hasError) return;

    const reader = new FileReader();
    reader.onload = function () {

        const product = {
            productId: Date.now(),
            productName,
            price: Number(price),
            description,
            image: reader.result
        };

        products.push(product);
        addToLocalStorage(products);

        document.querySelector("form").reset();
        document.querySelectorAll(".is-valid")
            .forEach(el => el.classList.remove("is-valid"));
    };

    reader.readAsDataURL(image);
    showToast("Product added successfully", "success");
}

renderProducts(products);

function editProduct(productId) {
    let products = getProducts();
    const p = products.find(p => p.productId == productId);
    if (!p) return;

    editMode = true;
    editId = productId;

    let qs = document.querySelector(".update-product")
    qs.innerHTML = `
                <h5 class="mb-3 fw-semibold">Update Product</h5>
                <div class="row">
                    <div class="col-12 col-sm-4 form-group mb-2">
                        <input type="text" id="product-name" class="form-control" placeholder="Product Name" value="${escapeHtmlAttribute(p.productName)}">
                        <p id="validate-product-name"></p>
                    </div>
                    <div class="col-12 col-sm-4 form-group mb-2">
                        <input type="number" id="product-price" class="form-control" placeholder="Product Price" value="${escapeHtmlAttribute(p.price)}">
                        <p id="validate-product-price"></p>
                    </div>
                    <div class="col-12 col-sm-4 form-group mb-2">
                        <form id="uploadForm" enctype="multipart/form-data">
                            <input type="file" id="product-image" accept="image/*" class="form-control" aria-label="Product Image">
                        </form>
                        <p id="validate-product-image"></p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-sm-12 col-lg-8 form-group">
                        <textarea class="form-control" id="product-desc" placeholder="Product Description">${p.description}</textarea>
                        <p id="validate-product-desc"></p>
                    </div>
                    <div class="col-6 col-sm-6 col-lg-2 mt-2 form-group">
                        <button class="btn btn-primary form-control" onclick="updateProduct(${productId})"> Update Product </button>
                    </div>
                    <div class="col-6 col-sm-6 col-lg-2 mt-2 form-group">
                        <button class="btn btn-danger form-control" onclick="resetEdit(${productId})"> Cancel Update </button>
                    </div>
                </div>
    `

    showToast("Edit mode enabled. Update product details.", "success");

}

function updateProduct(productId) {

    if (!editMode) return;

    const nameEl = document.getElementById("product-name");
    const priceEl = document.getElementById("product-price");
    const descEl = document.getElementById("product-desc");
    const imgEl = document.getElementById("product-image");

    const productName = nameEl.value.trim();
    const price = priceEl.value.trim();
    const description = descEl.value.trim();
    const image = imgEl.files[0];

    if (!productName || !price || price <= 0 || !description) {
        showToast("Please fill all fields correctly", "warning");

        return;
    }

    const existingProduct = products.find(p => p.productId == editId);

    if (image) {
        const reader = new FileReader();
        reader.onload = function () {
            saveUpdatedProduct(reader.result);
        };
        reader.readAsDataURL(image);
    } else {
        saveUpdatedProduct(existingProduct.image);
    }

    function saveUpdatedProduct(img) {
        products = products.map(p =>
            p.productId == editId
                ? {
                    ...p,
                    productName,
                    price: Number(price),
                    description,
                    image: img
                }
                : p
        );

        addToLocalStorage(products);
        resetEdit();

        showToast("Product updated successfully", "success");

    }
}

function resetEdit() {
    editMode = false;
    editId = null;

    document.querySelector(".update-product").innerHTML = addProductHTML;;
}

function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    products = products.filter(p => p.productId != productId);
    addToLocalStorage(products);

    showToast("Product deleted successfully", "danger");

}

function viewProduct(productId) {
    localStorage.setItem("view-product", JSON.stringify(productId));
    window.open("view.html");
}

function searchProduct() {
    let timer = null;

    searchInput.addEventListener("input", () => {
        if (timer != null) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            let val = searchInput.value.trim().toLowerCase();
            let products = getProducts();
            let filtered = products.filter(p =>
                p.productName.toLowerCase().includes(val) ||
                p.description.toLowerCase().includes(val) ||
                p.price.toString().includes(val) ||
                p.productId.toString().includes(val)
            );
            console.log(filtered);
            renderProducts(filtered);
        }, 300);
    });
}

searchProduct();

function sortProducts() {
    sortInput.addEventListener("change", (e) => {
        const sorted = getProducts();
        let val = e.target.value;

        switch (val) {
            case "product_id":
                sorted.sort((a, b) => a.productId - b.productId);
                break;
            case "product_name":
                sorted.sort((a, b) => {
                    const n1 = a.productName.toLowerCase();
                    const n2 = b.productName.toLowerCase();
                    if (n1 < n2) return -1;
                    else if (n1 > n2) return 1;
                    else return 0;
                });
                break;
            case "price_asc":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "price_desc":
                sorted.sort((a, b) => b.price - a.price)
            default:
                break;
        }
        console.log(sorted);
        renderProducts(sorted);
    })
}

sortProducts();

function showError(input, errorElement, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    errorElement.innerHTML = message;
}

function showSuccess(input, el) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    el.innerHTML = "";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.className = `toast-message show toast-${type}`;
    toast.innerText = message;

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

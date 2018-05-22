class PrimeFinder extends HTMLElement {
  constructor() {
    super();

    this.primeBox = null;
    this.primeInput = null;
    this.queryButton = null;
    this.primeResult = null;

    this.template = "/components/is-prime/is-prime.html";
  }

  async getTemplate() {
    const res = await fetch(this.template);
    const textTemplate = await res.text();

    return new DOMParser()
      .parseFromString(textTemplate, "text/html")
      .querySelector("template");
  }

  async connectedCallback() {
    const instance = (await this.getTemplate()).content.cloneNode(true);

    this.attachShadow({ mode: "open" }).appendChild(instance);

    this.primeBox = this.shadowRoot.querySelector(".prime-box");
    this.primeInput = this.shadowRoot.querySelector(".prime-input");
    this.queryButton = this.shadowRoot.querySelector(".queryButton");
    this.primeResult = this.shadowRoot.querySelector(".prime-result");

    this.queryButton.addEventListener("click", e => {

      if (!this.primeInput.value || /\D/.test(this.primeInput.value)) {
        this.primeResult.innerHTML = `Not a number`;
        return;
      }

      this.primeResult.innerHTML = "---";
      this.primeBox.style.background = "#FF001B";
      this.primeBox.style.borderColor = "#B20013";

      setTimeout(() => {
        const result = this.searchPrime(this.primeInput.value);
        this.primeResult.innerHTML = result ? "Yes" : "No";
        this.primeBox.style.background = "#00FF39";
        this.primeBox.style.borderColor = "#00B228";
      }, 0);
    });
  }

  static searchPrime(num) {
    if (num <= 1) {
      return false;
    } else if (num <= 3) {
      return true;
    } else if (num % 2 === 0 || num % 3 === 0) {
      return false;
    } else {
      let i = 5;

      while (i * i <= num) {
        for (let m = 0; m < 900000; m++) {}

        if (num % i === 0 || num % (i + 2) === 0) {
          return false;
        }

        i = i + 6;
      }

      return true;
    }
  }
}

customElements.define("prime-finder", PrimeFinder);

import { LitElement, html } from "../../node_modules/vodomg-litelement/@polymer/lit-element/lit-element.js";
import '../../node_modules/vo-merklogo/vo-merklogo.js';

/**
 * `vo-upload`
 * De upload component voor gebruik in websites en applicaties van de Vlaamse overheid
 *
 * @customElement
 * @polymer
 * @demo demo/vo-upload.html
 */
class VoUpload extends LitElement {
	/**
	 * Rendert het element.
	 * 
	 * @return {TemplateResult}
	 */
    render() {
    	return html`
    	`;
    }
}

customElements.define('vo-header', VoUpload);

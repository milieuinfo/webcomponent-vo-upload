import { LitElement, html } from "../../node_modules/vodomg-litelement/@polymer/lit-element/lit-element.js";
import '../../node_modules/dropzone/dist/dropzone.js';

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
	 * Constructor.
	 */
	constructor() {
		super();
		Dropzone.autoDiscover = false;
	}
	
	/**
	 * Configuratie van de dropzone na de eerste rendering.
	 */
	firstUpdated() {
		const element = this.shadowRoot.querySelector('#upload');
		this.dropzone = new Dropzone(element, {
			url: '/file/post'
		});
	}
	
	/**
	 * Rendert het element.
	 * 
	 * @return {TemplateResult}
	 */
    render() {
    	return html`
    		<div id="upload" class="dropzone"></div>
    	`;
    }
}

customElements.define('vo-upload', VoUpload);

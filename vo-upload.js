import { LitElement, html } from '../../node_modules/vodomg-litelement/@polymer/lit-element/lit-element.js';
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
		Dropzone.prototype.defaultOptions.dictDefaultMessage = "Sleep bestanden naar hier om op te laden";
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
    		<link rel="stylesheet" type="text/css" href="../node_modules/dropzone/dist/min/basic.min.css">
    		<link rel="stylesheet" type="text/css" href="../node_modules/dropzone/dist/min/dropzone.min.css">
    		<style>
    			#upload {
    				border: 1px solid rgb(51, 51, 51);
    			}
    			
    			#upload .dz-image {
    				border-radius: 0px;
    			}
    		</style>
    		<div id="upload" class="dropzone"></div>
    	`;
    }
}

customElements.define('vo-upload', VoUpload);

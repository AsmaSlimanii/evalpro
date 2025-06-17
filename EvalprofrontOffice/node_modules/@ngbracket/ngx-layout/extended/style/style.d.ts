/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgStyle } from '@angular/common';
import { DoCheck, ElementRef, KeyValueDiffers, Renderer2 } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseDirective2, MediaMarshaller, StyleUtils } from '@ngbracket/ngx-layout/core';
import { NgStyleMap, NgStyleType } from './style-transforms';
import * as i0 from "@angular/core";
export declare class StyleDirective extends BaseDirective2 implements DoCheck {
    protected sanitizer: DomSanitizer;
    private readonly ngStyleInstance;
    protected DIRECTIVE_KEY: string;
    protected fallbackStyles: NgStyleMap;
    protected isServer: boolean;
    constructor(elementRef: ElementRef, styler: StyleUtils, marshal: MediaMarshaller, sanitizer: DomSanitizer, differs: KeyValueDiffers, renderer2: Renderer2, ngStyleInstance: NgStyle, serverLoaded: boolean, platformId: Object);
    /** Add generated styles */
    protected updateWithValue(value: any): void;
    /** Remove generated styles */
    protected clearStyles(): void;
    /**
     * Convert raw strings to ngStyleMap; which is required by ngStyle
     * NOTE: Raw string key-value pairs MUST be delimited by `;`
     *       Comma-delimiters are not supported due to complexities of
     *       possible style values such as `rgba(x,x,x,x)` and others
     */
    protected buildStyleMap(styles: NgStyleType): NgStyleMap;
    /** For ChangeDetectionStrategy.onPush and ngOnChanges() updates */
    ngDoCheck(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<StyleDirective, [null, null, null, null, null, null, { optional: true; self: true; }, null, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StyleDirective, never, never, {}, {}, never, never, true, never>;
}
/**
 * Directive to add responsive support for ngStyle.
 *
 */
export declare class DefaultStyleDirective extends StyleDirective implements DoCheck {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultStyleDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultStyleDirective, "  [ngStyle],  [ngStyle.xs], [ngStyle.sm], [ngStyle.md], [ngStyle.lg], [ngStyle.xl],  [ngStyle.lt-sm], [ngStyle.lt-md], [ngStyle.lt-lg], [ngStyle.lt-xl],  [ngStyle.gt-xs], [ngStyle.gt-sm], [ngStyle.gt-md], [ngStyle.gt-lg]", never, { "ngStyle": { "alias": "ngStyle"; "required": false; }; "ngStyle.xs": { "alias": "ngStyle.xs"; "required": false; }; "ngStyle.sm": { "alias": "ngStyle.sm"; "required": false; }; "ngStyle.md": { "alias": "ngStyle.md"; "required": false; }; "ngStyle.lg": { "alias": "ngStyle.lg"; "required": false; }; "ngStyle.xl": { "alias": "ngStyle.xl"; "required": false; }; "ngStyle.lt-sm": { "alias": "ngStyle.lt-sm"; "required": false; }; "ngStyle.lt-md": { "alias": "ngStyle.lt-md"; "required": false; }; "ngStyle.lt-lg": { "alias": "ngStyle.lt-lg"; "required": false; }; "ngStyle.lt-xl": { "alias": "ngStyle.lt-xl"; "required": false; }; "ngStyle.gt-xs": { "alias": "ngStyle.gt-xs"; "required": false; }; "ngStyle.gt-sm": { "alias": "ngStyle.gt-sm"; "required": false; }; "ngStyle.gt-md": { "alias": "ngStyle.gt-md"; "required": false; }; "ngStyle.gt-lg": { "alias": "ngStyle.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

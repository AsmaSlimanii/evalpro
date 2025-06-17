/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, LayoutConfigOptions, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface LayoutStyleDisplay {
    readonly display: string;
}
export declare class LayoutStyleBuilder extends StyleBuilder {
    buildStyles(input: string, { display }: LayoutStyleDisplay): {
        display: string;
        'box-sizing': string;
        'flex-direction': string;
        'flex-wrap': string | null;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<LayoutStyleBuilder>;
}
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
export declare class LayoutDirective extends BaseDirective2 implements OnChanges {
    private _config;
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: LayoutStyleBuilder, marshal: MediaMarshaller, _config: LayoutConfigOptions);
    protected updateWithValue(input: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<LayoutDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<LayoutDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultLayoutDirective extends LayoutDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultLayoutDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultLayoutDirective, "  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],  [fxLayout.gt-md], [fxLayout.gt-lg]", never, { "fxLayout": { "alias": "fxLayout"; "required": false; }; "fxLayout.xs": { "alias": "fxLayout.xs"; "required": false; }; "fxLayout.sm": { "alias": "fxLayout.sm"; "required": false; }; "fxLayout.md": { "alias": "fxLayout.md"; "required": false; }; "fxLayout.lg": { "alias": "fxLayout.lg"; "required": false; }; "fxLayout.xl": { "alias": "fxLayout.xl"; "required": false; }; "fxLayout.lt-sm": { "alias": "fxLayout.lt-sm"; "required": false; }; "fxLayout.lt-md": { "alias": "fxLayout.lt-md"; "required": false; }; "fxLayout.lt-lg": { "alias": "fxLayout.lt-lg"; "required": false; }; "fxLayout.lt-xl": { "alias": "fxLayout.lt-xl"; "required": false; }; "fxLayout.gt-xs": { "alias": "fxLayout.gt-xs"; "required": false; }; "fxLayout.gt-sm": { "alias": "fxLayout.gt-sm"; "required": false; }; "fxLayout.gt-md": { "alias": "fxLayout.gt-md"; "required": false; }; "fxLayout.gt-lg": { "alias": "fxLayout.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

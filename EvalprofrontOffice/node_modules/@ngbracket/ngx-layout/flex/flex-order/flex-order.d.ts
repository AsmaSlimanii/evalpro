/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export declare class FlexOrderStyleBuilder extends StyleBuilder {
    buildStyles(value: string): {
        order: string | number;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexOrderStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FlexOrderStyleBuilder>;
}
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
export declare class FlexOrderDirective extends BaseDirective2 implements OnChanges {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexOrderStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    updateWithValue(input: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexOrderDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlexOrderDirective, never, never, {}, {}, never, never, true, never>;
}
export declare class DefaultFlexOrderDirective extends FlexOrderDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultFlexOrderDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultFlexOrderDirective, "  [fxFlexOrder], [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md],  [fxFlexOrder.lg], [fxFlexOrder.xl], [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md],  [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl], [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm],  [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]", never, { "fxFlexOrder": { "alias": "fxFlexOrder"; "required": false; }; "fxFlexOrder.xs": { "alias": "fxFlexOrder.xs"; "required": false; }; "fxFlexOrder.sm": { "alias": "fxFlexOrder.sm"; "required": false; }; "fxFlexOrder.md": { "alias": "fxFlexOrder.md"; "required": false; }; "fxFlexOrder.lg": { "alias": "fxFlexOrder.lg"; "required": false; }; "fxFlexOrder.xl": { "alias": "fxFlexOrder.xl"; "required": false; }; "fxFlexOrder.lt-sm": { "alias": "fxFlexOrder.lt-sm"; "required": false; }; "fxFlexOrder.lt-md": { "alias": "fxFlexOrder.lt-md"; "required": false; }; "fxFlexOrder.lt-lg": { "alias": "fxFlexOrder.lt-lg"; "required": false; }; "fxFlexOrder.lt-xl": { "alias": "fxFlexOrder.lt-xl"; "required": false; }; "fxFlexOrder.gt-xs": { "alias": "fxFlexOrder.gt-xs"; "required": false; }; "fxFlexOrder.gt-sm": { "alias": "fxFlexOrder.gt-sm"; "required": false; }; "fxFlexOrder.gt-md": { "alias": "fxFlexOrder.gt-md"; "required": false; }; "fxFlexOrder.gt-lg": { "alias": "fxFlexOrder.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

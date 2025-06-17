/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnInit } from '@angular/core';
import { BaseDirective2, ElementMatcher, LayoutConfigOptions, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
interface FlexBuilderParent {
    direction: string;
    hasWrap: boolean;
}
export declare class FlexStyleBuilder extends StyleBuilder {
    protected layoutConfig: LayoutConfigOptions;
    constructor(layoutConfig: LayoutConfigOptions);
    buildStyles(input: string, parent: FlexBuilderParent): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FlexStyleBuilder>;
}
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
export declare class FlexDirective extends BaseDirective2 implements OnInit {
    protected layoutConfig: LayoutConfigOptions;
    protected marshal: MediaMarshaller;
    protected DIRECTIVE_KEY: string;
    protected direction?: string;
    protected wrap?: boolean;
    get shrink(): string;
    set shrink(value: string);
    get grow(): string;
    set grow(value: string);
    protected flexGrow: string;
    protected flexShrink: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, layoutConfig: LayoutConfigOptions, styleBuilder: FlexStyleBuilder, marshal: MediaMarshaller);
    ngOnInit(): void;
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    protected onLayoutChange(matcher: ElementMatcher): void;
    /** Input to this is exclusively the basis input value */
    protected updateWithValue(value: string): void;
    /** Trigger a style reflow, usually based on a shrink/grow input event */
    protected triggerReflow(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FlexDirective, never, never, { "shrink": { "alias": "fxShrink"; "required": false; }; "grow": { "alias": "fxGrow"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class DefaultFlexDirective extends FlexDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultFlexDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultFlexDirective, "  [fxFlex], [fxFlex.xs], [fxFlex.sm], [fxFlex.md],  [fxFlex.lg], [fxFlex.xl], [fxFlex.lt-sm], [fxFlex.lt-md],  [fxFlex.lt-lg], [fxFlex.lt-xl], [fxFlex.gt-xs], [fxFlex.gt-sm],  [fxFlex.gt-md], [fxFlex.gt-lg]", never, { "fxFlex": { "alias": "fxFlex"; "required": false; }; "fxFlex.xs": { "alias": "fxFlex.xs"; "required": false; }; "fxFlex.sm": { "alias": "fxFlex.sm"; "required": false; }; "fxFlex.md": { "alias": "fxFlex.md"; "required": false; }; "fxFlex.lg": { "alias": "fxFlex.lg"; "required": false; }; "fxFlex.xl": { "alias": "fxFlex.xl"; "required": false; }; "fxFlex.lt-sm": { "alias": "fxFlex.lt-sm"; "required": false; }; "fxFlex.lt-md": { "alias": "fxFlex.lt-md"; "required": false; }; "fxFlex.lt-lg": { "alias": "fxFlex.lt-lg"; "required": false; }; "fxFlex.lt-xl": { "alias": "fxFlex.lt-xl"; "required": false; }; "fxFlex.gt-xs": { "alias": "fxFlex.gt-xs"; "required": false; }; "fxFlex.gt-sm": { "alias": "fxFlex.gt-sm"; "required": false; }; "fxFlex.gt-md": { "alias": "fxFlex.gt-md"; "required": false; }; "fxFlex.gt-lg": { "alias": "fxFlex.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}
export {};

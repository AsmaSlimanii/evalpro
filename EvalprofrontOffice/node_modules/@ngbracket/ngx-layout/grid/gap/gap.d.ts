import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridGapParent {
    inline: boolean;
}
export declare class GridGapStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridGapParent): {
        display: string;
        'grid-gap': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridGapStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridGapStyleBuilder>;
}
export declare class GridGapDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridGapStyleBuilder, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridGapDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridGapDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
export declare class DefaultGridGapDirective extends GridGapDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridGapDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridGapDirective, "  [gdGap],  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]", never, { "gdGap": { "alias": "gdGap"; "required": false; }; "gdGap.xs": { "alias": "gdGap.xs"; "required": false; }; "gdGap.sm": { "alias": "gdGap.sm"; "required": false; }; "gdGap.md": { "alias": "gdGap.md"; "required": false; }; "gdGap.lg": { "alias": "gdGap.lg"; "required": false; }; "gdGap.xl": { "alias": "gdGap.xl"; "required": false; }; "gdGap.lt-sm": { "alias": "gdGap.lt-sm"; "required": false; }; "gdGap.lt-md": { "alias": "gdGap.lt-md"; "required": false; }; "gdGap.lt-lg": { "alias": "gdGap.lt-lg"; "required": false; }; "gdGap.lt-xl": { "alias": "gdGap.lt-xl"; "required": false; }; "gdGap.gt-xs": { "alias": "gdGap.gt-xs"; "required": false; }; "gdGap.gt-sm": { "alias": "gdGap.gt-sm"; "required": false; }; "gdGap.gt-md": { "alias": "gdGap.gt-md"; "required": false; }; "gdGap.gt-lg": { "alias": "gdGap.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

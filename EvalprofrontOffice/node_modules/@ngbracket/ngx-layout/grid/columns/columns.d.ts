import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridColumnsParent {
    inline: boolean;
}
export declare class GridColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridColumnsParent): {
        display: string;
        'grid-auto-columns': string;
        'grid-template-columns': string;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<GridColumnsStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridColumnsStyleBuilder>;
}
export declare class GridColumnsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridColumnsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridColumnsDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export declare class DefaultGridColumnsDirective extends GridColumnsDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridColumnsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridColumnsDirective, "  [gdColumns],  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]", never, { "gdColumns": { "alias": "gdColumns"; "required": false; }; "gdColumns.xs": { "alias": "gdColumns.xs"; "required": false; }; "gdColumns.sm": { "alias": "gdColumns.sm"; "required": false; }; "gdColumns.md": { "alias": "gdColumns.md"; "required": false; }; "gdColumns.lg": { "alias": "gdColumns.lg"; "required": false; }; "gdColumns.xl": { "alias": "gdColumns.xl"; "required": false; }; "gdColumns.lt-sm": { "alias": "gdColumns.lt-sm"; "required": false; }; "gdColumns.lt-md": { "alias": "gdColumns.lt-md"; "required": false; }; "gdColumns.lt-lg": { "alias": "gdColumns.lt-lg"; "required": false; }; "gdColumns.lt-xl": { "alias": "gdColumns.lt-xl"; "required": false; }; "gdColumns.gt-xs": { "alias": "gdColumns.gt-xs"; "required": false; }; "gdColumns.gt-sm": { "alias": "gdColumns.gt-sm"; "required": false; }; "gdColumns.gt-md": { "alias": "gdColumns.gt-md"; "required": false; }; "gdColumns.gt-lg": { "alias": "gdColumns.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

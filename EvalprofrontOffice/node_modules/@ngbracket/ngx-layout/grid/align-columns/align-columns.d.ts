import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridAlignColumnsParent {
    inline: boolean;
}
export declare class GridAlignColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAlignColumnsParent): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAlignColumnsStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridAlignColumnsStyleBuilder>;
}
export declare class GridAlignColumnsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignColumnsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAlignColumnsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridAlignColumnsDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
export declare class DefaultGridAlignColumnsDirective extends GridAlignColumnsDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridAlignColumnsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridAlignColumnsDirective, "  [gdAlignColumns],  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],  [gdAlignColumns.gt-lg]", never, { "gdAlignColumns": { "alias": "gdAlignColumns"; "required": false; }; "gdAlignColumns.xs": { "alias": "gdAlignColumns.xs"; "required": false; }; "gdAlignColumns.sm": { "alias": "gdAlignColumns.sm"; "required": false; }; "gdAlignColumns.md": { "alias": "gdAlignColumns.md"; "required": false; }; "gdAlignColumns.lg": { "alias": "gdAlignColumns.lg"; "required": false; }; "gdAlignColumns.xl": { "alias": "gdAlignColumns.xl"; "required": false; }; "gdAlignColumns.lt-sm": { "alias": "gdAlignColumns.lt-sm"; "required": false; }; "gdAlignColumns.lt-md": { "alias": "gdAlignColumns.lt-md"; "required": false; }; "gdAlignColumns.lt-lg": { "alias": "gdAlignColumns.lt-lg"; "required": false; }; "gdAlignColumns.lt-xl": { "alias": "gdAlignColumns.lt-xl"; "required": false; }; "gdAlignColumns.gt-xs": { "alias": "gdAlignColumns.gt-xs"; "required": false; }; "gdAlignColumns.gt-sm": { "alias": "gdAlignColumns.gt-sm"; "required": false; }; "gdAlignColumns.gt-md": { "alias": "gdAlignColumns.gt-md"; "required": false; }; "gdAlignColumns.gt-lg": { "alias": "gdAlignColumns.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

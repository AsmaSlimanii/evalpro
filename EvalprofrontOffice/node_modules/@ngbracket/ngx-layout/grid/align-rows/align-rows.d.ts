import { ElementRef } from '@angular/core';
import { BaseDirective2, MediaMarshaller, StyleBuilder, StyleDefinition, StyleUtils } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
export interface GridAlignRowsParent {
    inline: boolean;
}
export declare class GridAlignRowsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAlignRowsParent): StyleDefinition;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAlignRowsStyleBuilder, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<GridAlignRowsStyleBuilder>;
}
export declare class GridAlignRowsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignRowsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<GridAlignRowsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<GridAlignRowsDirective, never, never, { "inline": { "alias": "gdInline"; "required": false; }; }, {}, never, never, true, never>;
}
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
export declare class DefaultGridAlignRowsDirective extends GridAlignRowsDirective {
    protected inputs: string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<DefaultGridAlignRowsDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DefaultGridAlignRowsDirective, "  [gdAlignRows],  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],  [gdAlignRows.gt-lg]", never, { "gdAlignRows": { "alias": "gdAlignRows"; "required": false; }; "gdAlignRows.xs": { "alias": "gdAlignRows.xs"; "required": false; }; "gdAlignRows.sm": { "alias": "gdAlignRows.sm"; "required": false; }; "gdAlignRows.md": { "alias": "gdAlignRows.md"; "required": false; }; "gdAlignRows.lg": { "alias": "gdAlignRows.lg"; "required": false; }; "gdAlignRows.xl": { "alias": "gdAlignRows.xl"; "required": false; }; "gdAlignRows.lt-sm": { "alias": "gdAlignRows.lt-sm"; "required": false; }; "gdAlignRows.lt-md": { "alias": "gdAlignRows.lt-md"; "required": false; }; "gdAlignRows.lt-lg": { "alias": "gdAlignRows.lt-lg"; "required": false; }; "gdAlignRows.lt-xl": { "alias": "gdAlignRows.lt-xl"; "required": false; }; "gdAlignRows.gt-xs": { "alias": "gdAlignRows.gt-xs"; "required": false; }; "gdAlignRows.gt-sm": { "alias": "gdAlignRows.gt-sm"; "required": false; }; "gdAlignRows.gt-md": { "alias": "gdAlignRows.gt-md"; "required": false; }; "gdAlignRows.gt-lg": { "alias": "gdAlignRows.gt-lg"; "required": false; }; }, {}, never, never, true, never>;
}

/**
 * QuillForms Dependencies
 */
import {
	ToggleControl,
	BaseControl,
	ControlWrapper,
	ControlLabel,
} from '@quillforms/admin-components';

// @ts-expect-error
import { ThemeCard, ThemeListItem } from '@quillforms/theme-editor';
import type { BlockAttributes } from '@quillforms/types';

/**
 * WordPress Dependencies
 */
import { FocalPointPicker, RangeControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Fragment } from 'react';
import { MediaUpload } from '@wordpress/media-utils';

/**
 * External Dependencies
 */
import { isEmpty } from 'lodash';
import { css } from 'emotion';
/**
 * Internal Dependencies
 */
import BlockThemeControl from '../block-theme';
import CustomHTML from '../block-custom-html';
import BlockLayout from '../block-layout';
import BorderRadiusTemplates from '../border-radius-templates';
interface Props {
	blockName: string;
	attributes?: BlockAttributes;
	setAttributes: ( x: Record< string, unknown > ) => void;
}
const DefaultControls: React.FC< Props > = ( {
	blockName,
	attributes,
	setAttributes,
} ) => {
	const {
		editableSupport,
		requiredSupport,
		attachmentSupport,
		themeSupport,
	} = useSelect( ( select ) => {
		return {
			editableSupport: select( 'quillForms/blocks' ).hasBlockSupport(
				blockName,
				'editable'
			),
			requiredSupport: select( 'quillForms/blocks' ).hasBlockSupport(
				blockName,
				'required'
			),
			attachmentSupport: select( 'quillForms/blocks' ).hasBlockSupport(
				blockName,
				'attachment'
			),
			themeSupport: select( 'quillForms/blocks' ).hasBlockSupport(
				blockName,
				'theme'
			),
		};
	} );
	let required, attachment, blockTheme;
	if ( attributes ) {
		required = attributes.required;
		attachment = attributes.attachment;
		blockTheme = attributes.themeId;
	}
	return (
		<Fragment>
			{ editableSupport && requiredSupport && (
				<BaseControl>
					<ControlWrapper>
						<ControlLabel label={ 'Required' } />
						<ToggleControl
							checked={ required }
							onChange={ () =>
								setAttributes( {
									required: ! required,
								} )
							}
						/>
					</ControlWrapper>
				</BaseControl>
			) }

			{ attachmentSupport && (
				<>
					<BaseControl>
						<ControlWrapper>
							<ControlLabel label={ 'Image' } />
							{ isEmpty( attachment ) ? (
								<MediaUpload
									onSelect={ ( media ) =>
										setAttributes( {
											attachment: {
												type: 'image',
												url: media.url,
											},
										} )
									}
									allowedTypes={ [ 'image' ] }
									render={ ( { open } ) => (
										<button
											className="media-upload-btn"
											onClick={ open }
										>
											Add
										</button>
									) }
								/>
							) : (
								<button
									className="remove-media-btn"
									onClick={ () =>
										setAttributes( {
											attachment: {},
										} )
									}
									color="secondary"
								>
									Remove
								</button>
							) }
						</ControlWrapper>
					</BaseControl>
					<BaseControl>
						<ControlWrapper orientation="vertical">
							<ControlLabel
								label="Layout"
								isNew={ true }
							></ControlLabel>
							<BlockLayout
								layout={ attributes?.layout }
								setAttributes={ setAttributes }
							/>
						</ControlWrapper>
					</BaseControl>

					{ ( attributes?.layout === 'split-left' ||
						attributes?.layout === 'split-right' ) &&
						attributes?.attachment?.url && (
							<BaseControl>
								<ControlWrapper orientation="vertical">
									<ControlLabel
										label="Focal Point Picker"
										isNew={ true }
									></ControlLabel>
									<div
										className={ css`
											max-width: 300px;
										` }
									>
										<FocalPointPicker
											url={ attributes?.attachment?.url }
											value={
												attributes?.attachmentFocalPoint
											}
											onDragStart={ ( val ) => {
												setAttributes( {
													attachmentFocalPoint: val,
												} );
											} }
											onDrag={ ( val ) => {
												setAttributes( {
													attachmentFocalPoint: val,
												} );
											} }
											onChange={ ( val ) => {
												setAttributes( {
													attachmentFocalPoint: val,
												} );
											} }
										/>
									</div>
								</ControlWrapper>
							</BaseControl>
						) }

					{ ( attributes?.layout === 'float-left' ||
						attributes?.layout === 'float-right' ||
						attributes?.layout === 'stack' ) &&
						attributes?.attachment?.url && (
							<>
								<BaseControl>
									<ControlWrapper orientation="horizontal">
										<ControlLabel
											label="Set Maximum Width for attachment"
											isNew={ true }
										/>
										<ToggleControl
											checked={
												attributes?.attachmentMaxWidth !==
												'none'
											}
											onChange={ () => {
												if (
													attributes?.attachmentMaxWidth ===
													'none'
												) {
													setAttributes( {
														attachmentMaxWidth:
															'200px',
													} );
												} else {
													setAttributes( {
														attachmentMaxWidth:
															'none',
													} );
												}
											} }
										/>
									</ControlWrapper>
									<>
										{ attributes.attachmentMaxWidth !==
											'none' && (
											<ControlWrapper orientation="vertical">
												<ControlLabel label="Maximum Width(px)" />
												<RangeControl
													value={ parseInt(
														attributes?.attachmentMaxWidth?.replace(
															'px',
															''
														) ?? '0'
													) }
													onChange={ ( value ) =>
														setAttributes( {
															attachmentMaxWidth:
																value + 'px',
														} )
													}
													min={ 50 }
													max={ 900 }
												/>
											</ControlWrapper>
										) }
									</>
								</BaseControl>
								<BaseControl>
									<ControlWrapper orientation="horizontal">
										<ControlLabel
											label="Use Fancy Border Radius"
											isNew={ true }
										></ControlLabel>
										<ToggleControl
											checked={
												attributes?.attachmentFancyBorderRadius
											}
											onChange={ () => {
												if (
													attributes.attachmentFancyBorderRadius
												) {
													setAttributes( {
														attachmentBorderRadius:
															'0px',
													} );
												}
												setAttributes( {
													attachmentFancyBorderRadius:
														! attributes.attachmentFancyBorderRadius,
												} );
											} }
										/>
									</ControlWrapper>
									{ attributes.attachmentFancyBorderRadius && (
										<ControlWrapper orientation="vertical">
											<ControlLabel label="Choose your favorite fancy border radius"></ControlLabel>
											<BorderRadiusTemplates
												onChange={ ( val ) => {
													setAttributes( {
														attachmentBorderRadius:
															val,
													} );
												} }
												attachmentBorderRadius={
													attributes.attachmentBorderRadius
												}
											/>
										</ControlWrapper>
									) }
								</BaseControl>
							</>
						) }
				</>
			) }
			<BaseControl>
				<ControlWrapper orientation="vertical">
					<ControlLabel label={ 'Custom HTML' } isNew={ true } />
					<CustomHTML
						value={ attributes?.customHTML }
						onChange={ ( val ) => {
							setAttributes( { customHTML: val } );
						} }
					/>
				</ControlWrapper>
			</BaseControl>
			{ themeSupport && (
				<BlockThemeControl
					blockTheme={ blockTheme }
					setAttributes={ setAttributes }
				/>
			) }
		</Fragment>
	);
};
export default DefaultControls;

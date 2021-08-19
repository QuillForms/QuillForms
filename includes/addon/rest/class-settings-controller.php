<?php
/**
 * Settings_Controller class.
 *
 * @since 1.3.0
 * @package QuillForms
 */

namespace QuillForms\Addon\REST;

use QuillForms\Addon\Addon;
use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Settings_Controller abstract class.
 *
 * @since 1.3.0
 */
abstract class Settings_Controller {

	/**
	 * Endpoint namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'qf/v1';

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base;

	/**
	 * Rest endpoint.
	 *
	 * @var string
	 */
	protected $rest_endpoint = '/settings';

	/**
	 * Properties allowed to get
	 *
	 * @var array
	 */
	protected $gettable_properties = array();

	/**
	 * Properties allowed to update
	 *
	 * @var array
	 */
	protected $updatable_properties = array();

	/**
	 * Addon
	 *
	 * @var Addon
	 */
	protected $addon;

	/**
	 * Constructor.
	 *
	 * @since 1.3.0
	 *
	 * @param Addon $addon Addon.
	 */
	public function __construct( $addon ) {
		$this->addon     = $addon;
		$this->rest_base = "addons/{$this->addon->slug}{$this->rest_endpoint}";

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register controller routes
	 *
	 * @since 1.3.0
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			"/{$this->rest_base}",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'get_permissions_check' ),
					'args'                => array(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update' ),
					'permission_callback' => array( $this, 'update_permissions_check' ),
					'args'                => rest_get_endpoint_args_for_schema( $this->get_schema(), WP_REST_Server::CREATABLE ),
				),
			)
		);
	}

	/**
	 * Retrieves schema, conforming to JSON Schema.
	 *
	 * @since 1.3.0
	 *
	 * @return array
	 */
	abstract public function get_schema();

	/**
	 * Retrieves settings.
	 *
	 * @since 1.3.0
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get( $request ) { // phpcs:ignore
		$settings = $this->addon->settings->get_filtered();
		$settings = array_filter(
			$settings,
			function( $key ) {
				return in_array( $key, $this->gettable_properties, true );
			},
			ARRAY_FILTER_USE_KEY
		);
		return new WP_REST_Response( $settings, 200 );
	}

	/**
	 * Checks if a given request has access to get settings.
	 *
	 * @since 1.3.0
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
	 */
	public function get_permissions_check( $request ) {
		$capability = 'manage_quillforms';
		return current_user_can( $capability, $request );
	}

	/**
	 * Updates settings.
	 *
	 * @since 1.3.0
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update( $request ) {
		$settings = $request->get_json_params();
		$settings = array_filter(
			$settings,
			function( $key ) {
				return in_array( $key, $this->updatable_properties, true );
			},
			ARRAY_FILTER_USE_KEY
		);

		$updated = $this->addon->settings->update_filtered( $settings );
		if ( $updated ) {
			return new WP_REST_Response( array( 'success' => true ), 200 );
		} else {
			return new WP_Error( "quillforms-{$this->addon->slug}-settings-update", esc_html__( 'Cannot update settings!', 'quillforms' ), array( 'status' => 422 ) );
		}
	}

	/**
	 * Checks if a given request has access to update settings.
	 *
	 * @since 1.3.0
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return true|WP_Error True if the request has read access, WP_Error object otherwise.
	 */
	public function update_permissions_check( $request ) {
		$capability = 'manage_quillforms';
		return current_user_can( $capability, $request );
	}

}
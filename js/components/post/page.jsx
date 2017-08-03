/* global ReactVerseSettings */
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import DocumentMeta from 'react-document-meta';
import BodyClass from 'react-body-class';
import he from 'he';

// Internal dependencies
import QueryPage from 'wordpress-query-page';
import { getPageIdFromPath, isRequestingPage, getPage } from 'wordpress-query-page/lib/selectors';
import ContentMixin from '../../utils/content-mixin';

// Components
import Media from './image';
import Comments from '../comments';
import Placeholder from '../placeholder';
import PostPreview from './preview';
import FrontPage from '../templates/front-page';
import ContactPage from '../templates/contact-page';

const SinglePage = React.createClass( {
	mixins: [ ContentMixin ],

	renderArticle() {
		const post = this.props.post;

		if ( ! post ) {
			return null;
		}

		const template = post.template.split('.')[0];
		if ( template == 'front-page' ) {
			return <FrontPage post={ post }/>
		} else
		if ( template == 'contact-page' ) {
			return <ContactPage post={ post }/>
		}


		const meta = {
			title: post.title.rendered + ' – ' + ReactVerseSettings.meta.title,
			description: post.excerpt.rendered,
			canonical: post.link,
		};
		meta.title = he.decode( meta.title );

		const classes = classNames( {
			entry: true
		} );
		const featuredMedia = this.getFeaturedMedia( post );

		return (
			<article id={ `post-${ post.id }` } className={ classes }>
				<DocumentMeta { ...meta } />
				<BodyClass classes={ [ 'page', 'single', 'single-page' ] } />
				<h1 className="entry-title" ><span className="purple-gradient" dangerouslySetInnerHTML={ this.getTitle( post ) }/></h1>
				{ featuredMedia ?
					<Media media={ featuredMedia } parentClass='entry-image' /> :
					null
				}
				<div className="entry-meta"></div>
				<div className="entry-content" dangerouslySetInnerHTML={ this.getContent( post ) } />
			</article>
		);
	},

	renderComments() {
		const post = this.props.post;
		if ( ! post ) {
			return null;
		}

		return (
			<Comments
				postId={ this.props.postId }
				title={ <span dangerouslySetInnerHTML={ this.getTitle( post ) } /> }
				commentsOpen={ 'open' === post.comment_status } />
		)
	},

	render() {
		if ( !! this.props.previewId ) {
			return (
				<PostPreview id={ this.props.previewId } />
			);
		}

		return (
			<div className="card">
				<QueryPage pagePath={ this.props.path } />

				{ this.props.loading ?
					<Placeholder type="page" /> :
					this.renderArticle()
				}

				{ ! this.props.loading && this.renderComments() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	let path = ownProps.params.splat || ownProps.route.slug;
	if ( '/' === path[ path.length - 1 ] ) {
		path = path.slice( 0, -1 );
	}

	const postId = getPageIdFromPath( state, path );
	const requesting = isRequestingPage( state, path );
	const post = getPage( state, parseInt( postId ) );

	const previewId = ownProps.location.query.preview_id;

	return {
		previewId,
		path,
		postId,
		post,
		requesting,
		loading: requesting && ! post
	};
} )( SinglePage );

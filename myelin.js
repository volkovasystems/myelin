"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "myelin",
			"path": "myelin/myelin.js",
			"file": "myelin.js",
			"module": "myelin",
			"author": "Richeve S. Bebedor",
			"contributors": [
				"John Lenon Maghanoy <johnlenonmaghanoy@gmail.com>"
			],
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/myelin.git",
			"global": true,
			"class": true
		}
	@end-module-configuration

	@module-documentation:
		Server architecture layer to speed up server API development.
	@end-module-documentation

	@include:
		{
			"_": "lodash",
			"async": "async",
			"Dendron": "dendron",
			"diatom": "diatom",
			"doubt": "doubt",
			"harden": "harden",
			"heredito": "heredito",
			"Olivant": "olivant",
			"optcall": "optcall",
			"plough": "plough",
			"spalten": "spalten",
			"symbiote": "symbiote",
			"U200b": "u200b"
		}
	@end-include
*/

const _ = require( "lodash" );
const Dendron = require( "dendron" );
const diatom = require( "diatom" );
const doubt = require( "doubt" );
const falze = require( "falze" );
const harden = require( "harden" );
const heredito = require( "heredito" );
const Olivant = require( "olivant" );
const optcall = require( "optcall" );
const parallel = require( "async" ).parallel;
const plough = require( "plough" );
const protype = require( "protype" );
const spalten = require( "spalten" );
const symbiote = require( "symbiote" );
const series = require( "async" ).series;
const U200b = require( "u200b" );

harden( "ACTIVE", "active" );
harden( "DISABLED", "disabled" );
harden( "REMOVED", "removed" );
harden( "LOCKED", "locked" );

const Myelin = diatom( "Myelin" );

/*;
	@method-documentation:
		Extract data, list, factor
	@end-method-documentation

	@option:
		{
			"engine": "object",
			"query": "object",
			"data": "object"
		}
	@end-option
*/
Myelin.prototype.initialize = function initialize( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	//: If the first argument is not an object.
	if( !protype( arguments[ 0 ], OBJECT ) ){
		return this;
	}

	this.resolveData( option );

	this.resolveList( option );

	this.resolveFactor( option );

	callback( null, this, option );

	return this;
};

/*;
	@method-documentation:
		Hash is used to compare if the document is unique
			based on their uniqueness factors.
		This is changing whenever the factors are also modified.
		Creates an identity object in the option.
	@end-method-documentation

	@option:
		{
			"factor:required": "[*]",
			"identity": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.createHash = function createHash( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.factor ) ){
		Warning( "no factor given", option )
			.remind( "cannot create document hash" )
			.pass( callback, null, option );

		return this;
	}

	if( !doubt( option.factor ).ARRAY ){
		Warning( "invalid factor", option )
			.remind( "cannot create document hash" )
			.pass( callback, null, option );

		return this;
	}

	if( !option.factor.length ){
		Warning( "empty factor", option )
			.remind( "cannot create document hash" )
			.pass( callback, null, option );

		return this;
	}

	this.root( 1 ).createHash
		( option, function onCreateHash( issue, hash, option ){
			if( issue ){
				issue
					.remind( "failed document hash creation", option )
					.pass( callback, null, option );

			}else{
				option.query = { "hash": hash };

				this.method( "check" )
					( option, function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "cannot create document hash" )
								.pass( callback, null, option );

						}else if( exist ){
							Warning( "document hash duplicate", option )
								.remind( "cannot create document hash" )
								.pass( callback, null, option );

						}else{
							callback( null, hash, option );
						}
					} );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		This is a public reference for identifying the specific document.
			This reference never change.
		Creates an identity object in the option.
	@end-method-documentation

	@option:
		{
			"factor:required": "[*]",
			"identity": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.createReference = function createReference( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.factor ) ){
		Warning( "no factor given", option )
			.remind( "cannot create document reference"  )
			.pass( callback, null, option );

		return this;
	}

	if( !doubt( option.factor ).ARRAY ){
		Warning( "invalid factor", option )
			.remind( "cannot create document reference" )
			.pass( callback, null, option );

		return this;
	}

	if( !option.factor.length ){
		Warning( "invalid factor", option )
			.remind( "cannot create document reference" )
			.pass( callback, null, option );

		return this;
	}

	this.root( 1 ).createReference
		( option, function onCreateReference( issue, reference, option ){
			if( issue ){
				issue
					.remind( "failed document reference creation", option )
					.pass( callback, null, option );

			}else{
				option.query = { "reference": reference };

				this.method( "check" )
					( option, function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "cannot create document reference" )
								.pass( callback, null, option );

						}else if( exist ){
							Warning( "document reference duplicate", option )
								.remind( "cannot create document reference" )
								.pass( callback, null, option );

						}else{
							callback( null, reference, option );
						}
					} );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Stamp is used to reference the document on public level.
		A stamp code can be appended to the path and
			used as reference to get the document.
		Stamps changes when unique factors are modified
			but this will stay unique for every document.
		A short code will also be generated.
	@end-method-documentation

	@option:
		{
			"factor:required": "[*]",
			"identity": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.createStamp = function createStamp( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.factor ) ){
		Warning( "no factor given", option )
			.remind( "cannot create document stamp" )
			.pass( callback, null, option );

		return this;
	}

	if( !doubt( option.factor ).ARRAY ){
		Warning( "invalid factor", option )
			.remind( "cannot create document stamp" )
			.pass( callback, null, option );

		return this;
	}

	if( !option.factor.length ){
		Warning( "empty factor", option )
			.remind( "cannot create document stamp" )
			.pass( callback, null, option );

		return this;
	}

	let index = option.get( "index" ) || 0;
	option.set( "index", index );

	option.factor = option.factor.concat( [ index ] );

	this.root( 1 ).createStamp
		( option, function onCreateStamp( issue, stamp, option ){
			if( issue ){
				issue
					.remind( "failed document stamp creation", option )
					.pass( callback, null, option );

			}else{
				option.query = {
					"stamp.code": stamp.code,
					"short.code": option.identity.short.code
				};

				this.method( "check" )
					( option, function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "cannot create document stamp" )
								.pass( callback, null, option );

						}else if( exist ){
							Warning( "document stamp duplicate", option )
								.prompt( "reshuffling document stamp" );

							let index = option.get( "index" ) + 1;
							option.set( "index", index );

							option.factor.pop( );

							this.method( "create", "stamp" )( option, callback );

						}else{
							option.factor.pop( );

							callback( null, stamp, option );
						}
					} );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Generate all three identifications.
		This will generate identification for single document only.
		This will return the identity object.
	@end-method-documentation

	@option:
		{
			"factor:required": "[*]",
			"identity": "object",
			"data": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.generateIdentity = function generateIdentity( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.factor ) ){
		Warning( "no factor given", option )
			.remind( "cannot generate identity" )
			.pass( callback, null, option );

		return engine;
	}

	if( !doubt( option.factor ).ARRAY ){
		Warning( "invalid factor", option )
			.remind( "cannot generate identity" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.factor ) ){
		this.resolveFactor( option );
	}

	if( !option.factor.length ){
		Warning( "empty factor", option )
			.remind( "cannot generate identity" )
			.pass( callback, null, option );

		return this;
	}

	if( protype( option.data.name, STRING ) ){
		option.set( "name", option.data.name );

	}else{
		option.set( "name", this.name );
	}

	series( [
		function createHash( callback ){
			this.method( "create", "hash" )
				( option, function onCreateHash( issue, hash, option ){
					if( issue ){
						issue
							.remind( "failed hash creation", option )
							.remind( "create hash for identity" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function createReference( callback ){
			this.method( "create", "reference" )
				( option, function onCreateReference( issue, reference, option ){
					if( issue ){
						issue
							.remind( "failed reference creation", option )
							.remind( "create reference for identity" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function createStamp( callback ){
			this.method( "create", "stamp" )
				( option, function onCreateStamp( issue, stamp, option ){
					if( issue ){
						issue
							.remind( "failed stamp creation", option )
							.remind( "create stamp for identity" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed generate identity", option )
					.pass( callback, null, option );

			}else{
				let name = option.get( "name" );

				option.identity.code = `${ name }-${ option.identity.stamp.code }`;

				option.identity.code = U200b( option.identity.code ).raw( );

				option.identity.path = `/${ option.self.name }/${ option.identity.code }`;

				callback( null, option.identity, option );
			}

		} );

	return this;
};

/*;
	@method-documentation:
		Count active documents.
		Note that this should not be affected by any factors.
		This should only be affected by the query.
	@end-method-documentation

	@option:
		{
			"query": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.countDocument = function countDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option.query.status = option.query.status || ACTIVE;

	this.model
		.count( option.query )
		.exec( function onExecute( error, count ){
			if( error ){
				Issue( error, option )
					.remind( "failed document count" )
					.pass( callback, null, option );

			}else{
				callback( null, count, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Get the total count of active documents.
		Note that the query should only contain the status of the document.
	@end-method-documentation

	@option:
		{
			"query": "object",
			"self": "object"
		}
	@end-option
*/
Myelin.prototype.totalDocument = function totalDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	let status = option.query.status || ACTIVE;

	this.model
		.count( { "status": status } )
		.exec( function onExecute( error, count ){
			if( error ){
				Issue( error, option )
					.remind( "failed document total count" )
					.pass( callback, null, option );

			}else{
				callback( null, count, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Get the partition count of the document.
		Returns the suggested page count and size for the collection.
	@end-method-documentation

	@option:
		{
			"query": "object"
		}
	@end-option
*/
Myelin.prototype.partitionDocument = function partitionDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option.query.status = option.query.status || ACTIVE;

	this.method( "count" )
		( option, function onCountDocument( issue, count, option ){
			if( issue ){
				issue
					.remind( "document count for partition" )
					.pass( callback, null, option );

			}else if( count ){
				let pagination = spalten( count );

				option.pagination = option.pagination || { };

				let value = null;
				for( let property in pagination ){
					value = option.pagination[ property ];
					if( !protype( value, UNDEFINED ) ){
						option.pagination[ property ] = value;

					}else{
						option.pagination[ property ] = pagination[ property ];
					}
				}

				callback( null, pagination, option );

			}else{
				Warning( "count is zero", option )
					.remind( "cannot partition document" )
					.remind( "document count for partition" )
					.pass( callback, null, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Check the active document existence based on the given query.
		By default, it checks for single document.
		Pass a condition function to test for the count of possible documents.
		Results to true or false.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"condition:required": "function"
		}
	@end-option
*/
Myelin.prototype.checkDocument = function checkDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option.condition = option.condition ||
		function condition( count ){
			return count === 1;
		};

	if( !protype( option.condition, FUNCTION ) ){
		Warning( "invalid condition", option )
			.remind( "cannot check document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	this.method( "count" )
		( option, function onCountDocument( issue, count, option ){
			if( issue ){
				issue
					.remind( "document count for check" )
					.pass( callback, null, option );

			}else{
				callback( null, option.condition( count ), option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Test if the collection or query will return any document.
		The condition is set to one or many.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.testDocument = function testDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option.query.status = option.query.status || ACTIVE;

	option.condition = function condition( count ){
		return count > 0;
	};

	this.method( "check" )
		( option, function onCheckDocument( issue, exist, option ){
			if( issue ){
				issue
					.remind( "document check for test" )
					.pass( callback, null, option );

			}else{
				callback( null, exist, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Get active document with all properties.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.rawDocument = function rawDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot get raw document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "raw document count before retrieval" )
							.pass( callback );

					}else if( count == 1 ){
						callback( );

					}else{
						Warning( "multiple raw document retrieval", option )
							.remind( "document count before retrieval" )
							.pass( callback );
					}
				} );
		},

		function checkDocument( callback ){
			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "raw document check before retrieval" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "raw document does not exist", option )
							.remind( "raw document check before retrieval" )
							.pass( callback );
					}
				} );
		},

		function getRawDocument( callback ){
			this.model
				.findOne( option.query )
				.exec( function onExecute( error, data ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( data ) ){
						Warning( "empty raw document", option )
							.pass( callback );

					}else{
						option.data = data;

						option[ option.self.label ] = data;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed raw document retrieval", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} );

	return this;
},

/*;
	@method-documentation:
		Get active document with limited properties
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"scope:required": "function"
		}
	@end-option
*/
Myelin.prototype.getDocument = function getDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot get document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before retrieval" )
							.pass( callback );

					}else if( count == 1 ){
						callback( );

					}else{
						Warning( "multiple document retrieval", option )
							.remind( "document count before retrieval" )
							.pass( callback );
					}
				} );
		},

		function checkDocument( callback ){
			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check before retrieval" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exist", option )
							.remind( "document check before retrieval" )
							.pass( callback );
					}
				} );
		},

		function getDocument( callback ){
			this.model
				.findOne( option.query )
				.exec( function onExecute( error, data ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( data ) ){
						Warning( "empty document", option )
							.pass( callback );

					}else{
						option.data = data;

						option[ option.self.label ] = data;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document retrieval", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Access public properties of active document.
		This will return lean object.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"scope:required": "function"
		}
	@end-option
*/
Myelin.prototype.accessDocument = function accessDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot access document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before access" )
							.pass( callback );

					}else if( count == 1 ){
						callback( );

					}else{
						Warning( "multiple document retrieval", option )
							.remind( "document count before access" )
							.pass( callback );
					}
				} );
		},

		function checkDocument( callback ){
			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check before access" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exist", option )
							.remind( "document check before access" )
							.pass( callback );
					}
				} );
		},

		function accessDocument( callback ){
			this.model
				.findOne( option.query )
				.lean( )
				.exec( function onExecute( error, data ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( data ) ){
						Warning( "empty document", option )
							.pass( callback );

					}else{
						option.data = data;

						option[ option.self.label ] = data;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document access", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		List active document based on query with pagination.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"scope:required": "function",
			"pagination:required": "object"
		}
	@end-option
*/
Myelin.prototype.listDocument = function listDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( falze( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot list document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	let pagination = option.pagination || { };
	pagination.index = pagination.index || 0;
	pagination.size = pagination.size || 5;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before list" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to list", option )
							.remind( "cannot list document" )
							.remind( "document test before list" )
							.pass( callback );
					}
				} );
		},

		function partitionDocument( callback ){
			this.method( "partition" )
				( option, function onPartitionDocument( issue, pagination, option ){
					if( issue ){
						issue
							.remind( "document partition before list" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before list" )
							.pass( callback );

					}else if( count && count <= size ){
						pagination.size = count;
						pagination.index = 0;
						pagination.count = 1;

						callback( );

					}else{
						callback( );
					}
				} );
		},

		function listDocument( callback ){
			this.model
				.find( option.query )
				.skip( pagination.index * pagination.size )
				.limit( pagination.size )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Warning( "document list empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = list;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document list", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Sort active document based on query with pagination.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"scope:required": "function",
			"pagination:required": "object"
		}
	@end-option
*/
Myelin.prototype.sortDocument = function sortDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot sort document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	var pagination = option.pagination || { };

	if( !pagination.sort ){
		Warning( "no sort given", option )
			.remind( "cannot sort document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( pagination.sort ) ){
		Warning( "empty sort", option )
			.remind( "cannot sort document" )
			.pass( callback, null, option );

		return this;
	}

	pagination.index = pagination.index || 0;
	pagination.size = pagination.size || 5;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before sort" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to sort", option )
							.remind( "cannot sort document" )
							.remind( "document test before sort" )
							.pass( callback );
					}
				} );
		},

		function partitionDocument( callback ){
			this.method( "partition" )
				( option, function onPartitionDocument( issue, pagination, option ){
					if( issue ){
						issue
							.remind( "document partition before sort" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before sort" )
							.pass( callback );

					}else if( count && count <= size ){
						pagination.size = count;
						pagination.index = 0;
						pagination.count = 1;

						callback( );

					}else{
						callback( );
					}
				} );
		},

		function sortDocument( callback ){
			this.model
				.find( option.query )
				.sort( pagination.sort )
				.skip( pagination.index * pagination.size )
				.limit( pagination.size )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Issue( "document sort empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = list;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document sort", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Search active documents with pagination.

		Note that query must be specified.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"scope:required": "function",
			"pagination:required": "object"
		}
	@end-option
*/
Myelin.prototype.searchDocument = function searchDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot search document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	var pagination = option.pagination || { };
	pagination.index = pagination.index || 0;
	pagination.size = pagination.size || 5;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before search" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to search", option )
							.remind( "cannot search document" )
							.remind( "document test before search" )
							.pass( callback );
					}
				} );
		},

		function partitionDocument( callback ){
			this.method( "partition" )
				( option, function onPartitionDocument( issue, pagination, option ){
					if( issue ){
						issue
							.remind( "document partition before search" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before search" )
							.pass( callback );

					}else if( count && count <= size ){
						pagination.size = count;
						pagination.index = 0;
						pagination.count = 1;

						callback( );

					}else{
						callback( );
					}
				} );
		},

		function searchDocument( callback ){
			this.model
				.find( option.query )
				.skip( pagination.index * pagination.size )
				.limit( pagination.size )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Warning( "document search result empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = label;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document search", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Get all document regardless of their status.
		Scope is not applied.
	@end-method-documentation
*/
Myelin.prototype.allDocument = function allDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	this.model
		.find( )
		.exec( function onExecute( error, list ){
			if( error ){
				Issue( error, option )
					.remind( "failed all document retrieval" )
					.pass( callback, null, option );

			}else if( _.isEmpty( list ) ){
				Warning( "empty document", option )
					.remind( "failed all document retrieval" )
					.pass( callback, null, option );

			}else{
				option.list = list;

				option[ option.self.label ] = list;

				callback( null, list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Customisable way to get many document based on query.
		Scope is not applied.
		This procedure can be time consuming depending on the query.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.queryDocument = function queryDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot query document" )
			.pass( callback, null, option );

		return this;
	}

	series( [
		function checkDocument( callback ){
			option.condition = function condition( count ){
				return count > 1;
			};

			this.method( "check" )
				( option, function onCheckDocument( issue, result, option ){
					if( issue ){
						issue
							.remind( "document check before query" )
							.pass( callback );

					}else if( result ){
						callback( );

					}else{
						Warning( "cannot query document", option )
							.remind( "document check before query" )
							.pass( callback );
					}
				} );
		},

		function queryDocument( callback ){
			this.model
				.find( option.query )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Warning( "document query result empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = list;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document query", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Summarize active documents with pagination and sorting.
		Note that query must be specified.
		Returns an array of references.
		All objects are lean documents.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"pagination:required": "object"
		}
	@end-option
*/
Myelin.prototype.summarizeDocument = function summarizeDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot summarize document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	let pagination = option.pagination || { };
	pagination.index = pagination.index || 0;
	pagination.size = pagination.size || 5;
	pagination.sort = pagination.sort || "-sort";

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before summary" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to search", option )
							.remind( "cannot summarize document" )
							.remind( "document test before summary" )
							.pass( callback );
					}
				} );
		},

		function partitionDocument( callback ){
			this.method( "partition" )
				( option, function onPartitionDocument( issue, pagination, option ){
					if( issue ){
						issue
							.remind( "document partition before summary" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before summary" )
							.pass( callback );

					}else if( count && count <= size ){
						pagination.size = count;
						pagination.index = 0;
						pagination.count = 1;

						callback( );

					}else{
						callback( );
					}
				} );
		},

		function summarizeDocument( callback ){
			this.model
				.find( option.query )
				.sort( pagination.sort )
				.skip( pagination.index * pagination.size )
				.limit( pagination.size )
				.select( "reference" )
				.lean( )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Warning( "document summary empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = list;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document summary", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Scan active documents with pagination and sorting.
		Note that query must be specified.
		Returns an array of public references.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"pagination:required": "object"
		}
	@end-option
*/
Myelin.prototype.scanDocument = function scanDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot scan document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	let pagination = option.pagination || { };
	pagination.index = pagination.index || 0;
	pagination.size = pagination.size || 5;
	pagination.sort = pagination.sort || "-sort";

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before scan" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to scan", option )
							.remind( "cannot scan document" )
							.remind( "document test before scan" )
							.pass( callback );
					}
				} );
		},

		function partitionDocument( callback ){
			this.method( "partition" )
				( option, function onPartitionDocument( issue, pagination, option ){
					if( issue ){
						issue
							.remind( "document partition before scan" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before scan document" )
							.pass( callback );

					}else if( count && count <= size ){
						pagination.size = count;
						pagination.index = 0;
						pagination.count = 1;

						callback( );

					}else if( count ){
						callback( );

					}else{
						Warning( "cannot scan empty document", option )
							.remind( "document count before scan document" )
							.pass( callback );
					}
				} );
		},

		function scanDocument( callback ){
			this.model
				.find( option.query )
				.sort( pagination.sort )
				.skip( pagination.index * pagination.size )
				.limit( pagination.size )
				.select( "stamp code short path name" )
				.lean( )
				.exec( function onExecute( error, list ){
					if( error ){
						Issue( error, option )
							.pass( callback );

					}else if( _.isEmpty( list ) ){
						Warning( "document scan empty", option )
							.pass( callback );

					}else{
						option.list = list;

						option[ option.self.label ] = list;

						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed scan document", option )
					.pass( callback );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};


/*;
	@method-documentation:
		Generate identification, add document and refreshes it.
	@end-method-documentation
*/
Myelin.prototype.createDocument = function createDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot create document" )
			.pass( callback, null, option );

		return this;
	}

	series( [
		function generateIdentity( callback ){
			this.method( "generate", "identity" )
				( option, function onGenerateIdentity( issue, identity, option ){
					if( issue ){
						issue
							.remind( "generate identity before create document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function addDocument( callback ){
			this.mergeIdentity( option );

			this.method( "add" )
				( option, function onAddDocument( issue, data, option ){
					if( issue ){
						issue.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function refreshDocument( callback ){
			this.method( "refresh" )
				( option, function onRefreshDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document refresh for create document" )
							.pass( callback )

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed create document", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} ).bind( this ) );

	return this;
};

/*;
	@method-documentation:
		Generate identification, assume document and refreshes it.
	@end-method-documentation

	@option:
		{
			"data:required": "object"
		}
	@end-option
*/
Myelin.prototype.touchDocument = function touchDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot touch document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.data ).ARRAY ){
		Warning( "invalid data", option )
			.remind( "cannot touch document" )
			.pass( callback, null, option );

		return this;
	}

	series( [
		function generateIdentity( callback ){
			this.method( "generate", "identity" )
				( option, function onGenerateIdentity( issue, identity, option ){
					if( issue ){
						issue
							.remind( "generate identity before touch document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function assumeDocument( callback ){
			this.mergeIdentity( option );

			this.method( "assume" )
				( option, function onAssumeDocument( issue, data, option ){
					if( issue ){
						issue.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function refreshDocument( callback ){
			this.method( "refresh" )
				( option, function onRefreshDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document refresh for touch document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue, data, option ){
			if( issue ){
				issue
					.remind( "failed touch document", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} ).bind( this ) );

	return this;
};
/*;
	@method-documentation:
		Add document in disable mode.
	@end-method-documentation
*/
Myelin.prototype.assumeDocument = function assumeDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot assume document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.data ).ARRAY ){
		Warning( "invalid data", option )
			.remind( "cannot assume document" )
			.pass( callback, null, option );

		return this;
	}

	option.data.status = DISABLED;

	this.method( "add" )
		( option, function onAssumeDocument( issue, data, option ){
			if( issue ){
				issue
					.remind( "failed assume document", option )
					.pass( callback, null, option );

			}else{
				callback( null, data, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Add document.
	@end-method-documentation

	@option:
		{
			"data:required": "object"
		}
	@end-option
*/
Myelin.prototype.addDocument = function addDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot add document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.data ).ARRAY ){
		Warning( "invalid data", option )
			.remind( "cannot add document" )
			.pass( callback, null, option );

		return this;
	}

	option.data.status = option.data.status || ACTIVE;

	series( [
		function prepareDocument( callback ){
			this.resolveElement( option );

			callback( );
		},

		function addDocument( callback ){
			let data = { };
			for( var property in option.data ){
				if( !doubt( option.data[ property ] ).ARRAY ){
					data[ property ] = option.data[ property ];
				}
			}

			( new this.model( data ) )
				.save( function onSave( error ){
					if( error ){
						Issue( error, option )
							.remind( "failed saving document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function pushElement( callback ){
			if( _.isEmpty( option.element ) ){
				callback( );

				return;
			}

			this.method( "push", "element" )
				( option, function onPushElement( issue, result, option ){
					if( issue ){
						issue
							.remind( "element push for add document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkDocument( callback ){
			if( !option.data.reference ){
				Issue( "reference does not exists", option )
					.remind( "cannot check document" )
					.remind( "document check for add document" )
					.pass( callback );

				return;
			}

			if( !option.data.status ){
				Issue( "status does not exists", option )
					.remind( "cannot check document" )
					.remind( "document check for add document" )
					.pass( callback );

				return;
			}

			option.query = option.query || { };
			option.query.reference = option.data.reference;
			option.query.status = option.data.status;

			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check for add document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Issue( "added document does not exists", option )
							.remind( "document check for add document" )
							.pass( callback );
					}
				} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document retrieved for add document" )
							.pass( callback );

					}else{
						callback( );
					}
				} )
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed add document", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Edit document by property.
		Single document update only.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"data:required": "object"
		}
	@end-option
*/
Myelin.prototype.editDocument = function editDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot edit document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot edit document" )
			.pass( callback, null, option );

		return this;
	}

	series( [
		function prepareDocument( callback ){
			this.restrictData( option );

			this.resolveElement( option );

			this.resolveArray( option );

			//: We need to save the new data that will replace.
			option.set( "data", _.clone( option.data ) );

			callback( );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document retrieval before edit" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function editDocument( callback ){
			let data = option.get( "data" );

			let detail = option.data.toObject( );

			for( let property in detail ){
				if( !doubt( detail[ property ] ).ARRAY ){
					option.data[ property ] = data[ property ];
				}
			}

			callback( );
		},

		function saveDocument( callback ){
			option.data.save( function onSave( error ){
				if( error ){
					Issue( error, option )
						.remind( "failed document save" )
						.pass( callback );

				}else{
					callback( );
				}
			} );
		},

		function replaceElement( callback ){
			if( _.isEmpty( option.element ) ||
				_.isEmpty( option.array ) )
			{
				callback( );

				return;
			}

			this.method( "replace", "element" )
				( option, function onReplaceElement( issue, result, option ){
					if( issue ){
						issue
							.remind( "element replace for document edit" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function refreshDocument( callback ){
			this.method( "refresh" )
				( option, function onRefreshDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document refresh for edit" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue, data, option ){
			if( issue ){
				issue
					.remind( "failed document edit", option )
					.pass( callback, option.data, option );

			}else{
				callback( null, option.data, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Update the document using mongoose update method.
		This by default supports multiple update.
		If you wish to update a single document specify strict query.
		This will reset the document.
		All array property will be discarded.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"data:required": "object"
		}
	@end-option
*/
Myelin.prototype.updateDocument = function updateDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot update document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot update document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	option.setting = option.setting || { };
	if( typeof option.setting.multi != "boolean" ){
		option.setting.multi = true;
	}

	//: Don't upsert!
	delete option.setting.upsert;

	series( [
		function prepareDocument( callback ){
			this.restrictData( option );

			for( let property in option.data ){
				let data = option.data[ property ];

				if( doubt( data ).ARRAY ){
					delete option.data[ property ];
				}
			}

			callback( );
		},

		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before update" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to update", option )
							.remind( "cannot update document" )
							.remind( "document test before update" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before update" )
							.pass( callback );

					}else{
						if( count == 1 ){
							option.setting.multi = false;

						}else{
							option.setting.multi = true;
						}

						option.set( "count", count );

						callback( );
					}
				} );
		},

		function updateDocument( callback ){
			this.model
				.update( option.query, { $set: option.data }, option.setting,
					function onUpdateDocument( error, result ){
						if( error ){
							Issue( error, option )
								.remind( "failed update operation" )
								.pass( callback );

							return;
						}

						var count = option.get( "count" );

						if( result.nModified == count ){
							callback( );

						}else{
							Warning( "unexpected update document count", option )
								.remind( "update document count", result.nModified )
								.remind( "expected document count", count )
								.pass( callback );
						}
					} );
		},

		function resetDocument( callback ){
			this.method( "reset" )
				( option, function onResetDocument( issue, result, option ){
					if( issue ){
						issue
							.remind( "document reset for update" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document update", option )
					.pass( issue, null, option );

			}else{
				callback( issue, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Modify the document using mongoose update method.
		This by default supports multiple update.
		If you wish to update a single document specify strict query.
		Modify method is more customisable.
		Handle with care when using this method.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"data:required": "object",
			"setting": "object"
		}
	@end-option
*/
Myelin.prototype.modifyDocument = function modifyDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot modify document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		Warning( "empty data", option )
			.remind( "cannot modify document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	option.setting = option.setting || { };
	if( typeof option.setting.multi != "boolean" ){
		option.setting.multi = true;
	}

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before modify document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document to modify", option )
							.remind( "cannot modify document" )
							.remind( "document test before modify document" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before modify document" )
							.pass( callback );

					}else{
						if( count == 1 ){
							option.setting.multi = false;

						}else{
							option.setting.multi = true;
						}

						callback( );
					}
				} );
		},

		function modifyDocument( callback ){
			this.model
				.update( option.query, option.data, option.setting,
					function onModifyDocument( error ){
						if( error ){
							Issue( error, option )
								.remind( "failed update operation" )
								.pass( callback );

						}else{
							callback( );
						}
					} );
		},

		function resetDocument( callback ){
			this.method( "reset" )
				( option, function onResetDocument( issue, result, option ){
					if( issue ){
						issue
							.remind( "document reset for modify" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed modify document", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Check element if existing on the document.
		Query should result to single document.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"element:required": "object"
		}
	@end-option
*/
Myelin.prototype.checkElement = function checkElement( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot check element" )
			.pass( callback, false, option );

		return this;
	}

	if( _.isEmpty( option.element ) ){
		Warning( "empty element", option )
			.remind( "cannot check element" )
			.pass( callback, false, option );

		return this;
	}

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before check element" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "check element for multiple document", option )
							.remind( "check element only to single document" )
							.remind( "document count before check element" )
							.pass( callback );

					}else if( count == 0 ){
						Warning( "document does not exists", option )
							.remind( "cannot check element" )
							.remind( "document count before check element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkElement( callback ){
			let query = _.clone( option.query );

			let element = option.element;

			let path = "";
			let value = "";
			if( element.type == "object" ){
				let label = ( element.reference && "reference" ) || ( element.name && "name" );
				path = `${ element.property }.${ label }`;
				value = element.reference || element.name;

			}else{
				path = element.property;
				value = element.value;
			}

			query[ path ] = value;

			this.method( "check" )
				( { "query": query }, function onCheckDocument( issue, exist, choice ){
					if( issue ){
						issue
							.remind( "element check at", path, "using", value )
							.remind( "document check for element check" )
							.pass( callback );

					}else{
						option.set( "exist", exist );

						callback( );
					}
				} );
		},

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed element check", option )
					.pass( callback, false, option );

			}else{
				callback( null, option.get( "exist" ), option );
			}
		} );
};

/*;
	@method-documentation:
		Pushes element in the document's array property.
		All element must be unique to each other.
		Supports multiple element at multiple property.
		Query should result to single document.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"element:required": [
				"object",
				Array
			]
		}
	@end-option
*/
Myelin.prototype.pushElement = function pushElement( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot push element to document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.element ) ){
		Warning( "empty element", option )
			.remind( "cannot push element to document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.element ).ARRAY ){
		series( option.element
			.map( ( function onEachElement( element ){
				return ( function push( callback ){
					this.pushElement( {
						"query": option.query,
						"element": element
					}, function onPushElement( issue, result, option ){
						if( issue ){
							let element = option.element;
							let property = element.property;
							let value = element.value;

							issue
								.remind( "failed element push", option )
								.remind( "element push", property, value )
								.pass( callback );

						}else{
							callback( );
						}
					} );
				} ).bind( this );

			} ).bind( this ) ),

			function lastly( issue ){
				if( issue ){
					issue
						.remind( "failed multiple element push", option )
						.pass( callback, false, option );

				}else{
					callback( null, true, option );
				}
			} );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "failed document count", option )
							.remind( "document count before push element" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "push element to multiple document", option )
							.remind( "push element only to single document" )
							.remind( "document count before push element" )
							.pass( callback );

					}else if( count == 0 ){
						Warning( "document does not exists", option )
							.remind( "cannot push element" )
							.remind( "document count before push element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkElement( callback ){
			this.method( "check", "element" )
				( option, function onCheckElement( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed element check", option )
							.remind( "element check before push element" )
							.pass( callback );

					}else if( exist ){
						Warning( "element exists", option )
							.remind( "cannot push element" )
							.remind( "element check before push element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "failed document retrieval", option )
							.remind( "document retrieve before push element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function pushElement( callback ){
			let element = option.element;
			let property = element.property;

			if( element.type == "object" ){
				option.data[ property ].push( element.value );

			}else{
				option.data[ property ].addToSet( element.value );
			}

			option.data.save( function onSave( error ){
				if( error ){
					Issue( error, option )
						.remind( "failed saving document" )
						.pass( callback );

				}else{
					callback( );
				}
			} );
		},

		function checkElement( callback ){
			this.method( "check", "element" )
				( option, function onCheckElement( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed element check", option )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "element does not exists", option )
							.remind( "element check for push element" )
							.pass( callback );
					}
				} );
		},

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed element push", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Pop element in the document's array property.
		Supports multiple element at multiple property.
		Query should result to single document.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"element:required": "object"
		}
	@end-option
*/
Myelin.prototype.pullElement = function pullElement( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot pull element from document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.element ) ){
		Warning( "empty element", option )
			.remind( "cannot pull element from document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.element ).ARRAY ){
		series( option.element
			.map( ( function onEachElement( element ){
				return ( function pull( callback ){
					this.pullElement( {
						"query": option.query,
						"element": element
					}, function onPullElement( issue, result, option ){
						if( issue ){
							let element = option.element;
							let property = element.property;
							let value = element.value;

							issue
								.remind( "failed element pull", option )
								.remind( "element pull", property, value )
								.pass( callback );

						}else{
							callback( );
						}
					} );
				} ).bind( this );

			} ).bind( this ) ),

			function lastly( issue ){
				if( issue ){
					issue
						.remind( "failed multiple element pull", option )
						.pass( callback, false, option );

				}else{
					callback( null, true, option );
				}
			} );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "failed document count", option )
							.remind( "document count before pull element" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "pull element to multiple document", option )
							.remind( "pull element only to single document" )
							.remind( "document count before pull element" )
							.pass( callback );

					}else if( count == 0 ){
						Warning( "document does not exists", option )
							.remind( "cannot pull element" )
							.remind( "document count before pull element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkElement( callback ){
			this.method( "check", "element" )
				( option, function onCheckElement( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed element check", option )
							.remind( "element check before pull element" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "element exists", option )
							.remind( "cannot pull element" )
							.remind( "element check before pull element" )
							.pass( callback );
					}
				} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "failed document retrieval", option )
							.remind( "document retrieve before push element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function pullElement( callback ){
			let element = option.element;
			let property = element.property;

			if( element.type == "object" ){
				option.data[ property ].forEach( function onEachElement( item ){
					if( item.reference == element.reference ||
						item.name == element.name )
					{
						option.data[ property ].pull( item._id );
					}
				} );

			}else{
				option.data[ property ].pull( element.value );
			}

			option.data.save( function onSave( error ){
				if( error ){
					Issue( error, option )
						.remind( "failed saving document" )
						.pass( callback );

				}else{
					callback( );
				}
			} );
		},

		function checkElement( callback ){
			this.method( "check", "element" )
				( option, function onCheckElement( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed element check", option )
							.remind( "element check for pull element" )
							.pass( callback );

					}else if( exist ){
						Warning( "element still exists", option )
							.remind( "element check for pull element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed element pull", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Attempt to replace element if element already exists.
	@end-method-documentation

	@option:
		{
			"query:required": "object",
			"element:required": "object",
			"array": "object"
		}
	@end-option
*/
Myelin.prototype.replaceElement = function replaceElement( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot replace element to document" )
			.pass( callback, null, option );

		return this;
	}

	if( _.isEmpty( option.element ) ){
		Warning( "empty element", option )
			.remind( "cannot replace element to document" )
			.pass( callback, null, option );

		return this;
	}

	if( doubt( option.element ).ARRAY ){
		series( _.uniqBy( option.element, "name" )
			.map( ( function onEachElement( element ){
				return ( function replace( callback ){
					this.replaceElement( {
						"query": option.query,
						"array": option.array,
						"element": element,
					}, function onReplaceElement( issue, result, option ){
						if( issue ){
							let element = option.element;
							let array = option.array || { };
							let property = element.property;
							let value = array[ property ] || element.value;

							issue
								.remind( "failed element replace", option )
								.remind( "element replace", property, value )
								.pass( callback );

						}else{
							callback( );
						}
					} );
				} ).bind( this );

			} ).bind( this ) ),

			function lastly( issue ){
				if( issue ){
					issue
						.remind( "failed multiple element replace", option )
						.pass( callback, false, option );

				}else{
					callback( null, true, option );
				}
			} );

		return this;
	}

	series( [
		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "failed document count", option )
							.remind( "document count before replace element" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "replace element to multiple document", option )
							.remind( "replace element only to single document" )
							.remind( "document count before replace element" )
							.pass( callback );

					}else if( count == 0 ){
						Warning( "document does not exists", option )
							.remind( "cannot replace element" )
							.remind( "document count before replace element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkElement( callback ){
			this.method( "check", "element" )
				( option, function onCheckElement( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed element check", option )
							.remind( "element check before replace element" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "element exists", option )
							.remind( "cannot pull element" )
							.remind( "element check before replace element" )
							.pass( callback );
					}
				} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "failed document retrieval", option )
							.remind( "document retrieve before replace element" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function replaceElement( callback ){
			let element = option.element;

			if( element.type == "object" ){
				let data = element.value;
				let name = element.property;

				option.data[ name ].forEach( function onEachElement( item ){
					if( item.reference == element.reference ||
						item.name == element.name )
					{
						for( let property in data ){
							item[ property ] = data[ property ];
						}
					}
				} );

			}else{
				let name = element.property;
				let data = option.array[ name ];

				option.data[ name ] = data;
			}
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed replace element", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );


	return this;
};

/*;
	@method-documentation:
		Refresh or reboot document.
		This will count first the document based on the query.
	@end-method-documentation
*/
Myelin.prototype.resetDocument = function resetDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot reset document" )
			.pass( callback, null, option );

		return this;
	}

	option.setting = option.setting || { "slack": true };
	if( !( "slack" in option.setting ) ){
		option.setting.slack = true;
	}

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before reset" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "empty document", option )
							.remind( "cannot reset document" )
							.remind( "document test before reset" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before reset" )
							.pass( callback );

					}else{
						option.set( "count", count );

						callback( );
					}
				} );
		},

		function resolveReset( callback ){
			var count = option.get( "count" );

			if( count == 1 ){
				this.method( "refresh" )
					( option, function onRefreshDocument( issue, data, option ){
						if( issue ){
							issue.pass( callback );

						}else{
							callback( );
						}
					} );

			}else{
				this.method( "reboot" )
					( option, function onRebootDocument( issue, list, option ){
						if( issue ){
							issue.pass( callback );

						}else{
							callback( );
						}
					} );
			}
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document reset", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.result, option );
			}
		} );
};

/*;
	@method-documentation:
		Refreshes multiple documents
		By default, the setting slack is true
			to drop the succeeding refreshes when error occurred.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.rebootDocument = function rebootDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot reboot document" )
			.pass( callback, null, option );

		return this;
	}

	option.setting = option.setting || { "slack": true };
	if( !( "slack" in option.setting ) ){
		option.setting.slack = true;
	}

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before reboot" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exist", option )
							.remind( "cannot reboot document" )
							.remind( "document test before reboot" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before reboot" )
							.pass( callback );

					}else if( count == 1 ){
						Warning( "single document reboot", option )
							.remind( "method allow multiple document reboot" )
							.remind( "document count before reboot" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function queryDocument( callback ){
			this.method( "query" )
				( option, function onQueryDocument( issue, list, option ){
					if( issue ){
						issue
							.remind( "document query before reboot" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function saveDocument( callback ){
			var list = option.list;

			parallel( plough( list )
				.map( function onEachData( detail ){
					return function saveData( callback ){
						detail.save( function onSave( error ){
							if( error ){
								var issue = Issue( error, detail, option )
									.remind( "failed saving document" )
									.remind( "document save for reboot document" );

								if( option.setting.slack ){
									issue.pass( callback );

								}else{
									issue.report( ).prompt( );

									callback( )
								}

							}else{
								callback( );
							}
						} );
					};
				} ),

				function lastly( issue ){
					if( issue ){
						issue
							.remind( "failed saving reboot document", option )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function queryDocument( callback ){
			this.method( "query" )
				( option, function onQueryDocument( issue, list, option ){
					if( issue ){
						issue
							.remind( "failed document query", option )
							.remind( "document query for reboot" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document reboot", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.list, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Refresh the document by re-saving it which in turn
			activates all database middleware hooks.
		This will strictly process one document only.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.refreshDocument = function refreshDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot refresh document" )
			.pass( callback, null, option );

		return this;
	}

	series( [
		function checkDocument( callback ){
			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "failed document check", option )
							.remind( "check document before refresh document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exist", option )
							.remind( "cannot refresh document" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "failed document count", option )
							.remind( "count document before refresh document" )
							.pass( callback );

					}else if( count == 1 ){
						callback( );

					}else{
						Warning( "multiple document refresh", option )
							.remind( "method allow single document refresh" )
							.remind( "count document before refresh document" )
							.pass( callback );
					}
				} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "get document before refresh document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function saveDocument( callback ){
			option.data.save( function onSave( error ){
				if( error ){
					Issue( error, option )
						.remind( "failed document save" )
						.pass( callback );

				}else{
					callback( );
				}
			} );
		},

		function getDocument( callback ){
			this.method( "get" )
				( option, function onGetDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "get document for refresh document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue ){
			if( issue ){
				issue
					.remind( "failed document refresh", option )
					.pass( callback, null, option );

			}else{
				callback( null, option.data, option );
			}
		} ).bind( this ) );

	return this;
};

/*;
	@method-documentation:
		Marks the document disabled.
		This will disable active documents only.
		This will disable single document.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.disableDocument = function disableDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/


	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot disable document" )
			.pass( callback, null, option );

		return this;
	}

	//: Disable only active documents.
	option.query.status = ACTIVE;

	option.data = { };
	option.data.status = DISABLED;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before disable document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "cannot disable document" )
							.remind( "document test before disable document" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before disable document" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "disable multiple document", option )
							.remind( "disable single document only" )
							.remind( "document count before disable document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function disableDocument( callback ){
			this.method( "edit" )
				( option, function onEditDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document edit for disable document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkDocument( callback ){
			option.query.status = DISABLED;

			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check for disable document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "document has not been disabled" )
							.remind( "document check for disable document" )
							.pass( callback );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( ){
			if( issue ){
				issue
					.remind( "failed disable document", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Activates a disabled document.
		This will activate a single document only.
		This will activate a disabled document only.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.resumeDocument = function resumeDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/


	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot resume document" )
			.pass( callback, null, option );

		return this;
	}

	//: Resume only disabled documents.
	option.query.status = DISABLED;

	option.data = { };
	option.data.status = ACTIVE;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before resume document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "cannot resume document" )
							.remind( "document test before resume document" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before resume document" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "resume multiple document", option )
							.remind( "resume single document only" )
							.remind( "document count before resume document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function resumeDocument( callback ){
			this.method( "edit" )
				( option, function onEditDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document edit for resume document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkDocument( callback ){
			option.query.status = ACTIVE;

			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check for resume document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "document has not been resumed" )
							.remind( "document check for resume document" )
							.pass( callback );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( ){
			if( issue ){
				issue
					.remind( "failed resume document", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};

/*;
	@method-documentation:
		Marks the document for removal.
		By default this will mark active documents,
			to mark disabled documents specify the status in the query.
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.removeDocument = function removeDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/


	if( _.isEmpty( option.query ) ){
		Warning( "empty query", option )
			.remind( "cannot remove document" )
			.pass( callback, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	option.data = { };
	option.data.status = REMOVED;

	series( [
		function testDocument( callback ){
			this.method( "test" )
				( option, function onTestDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document test before remove document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "cannot remove document" )
							.remind( "document test before remove document" )
							.pass( callback );
					}
				} );
		},

		function countDocument( callback ){
			this.method( "count" )
				( option, function onCountDocument( issue, count, option ){
					if( issue ){
						issue
							.remind( "document count before remove document" )
							.pass( callback );

					}else if( count > 1 ){
						Warning( "remove multiple document", option )
							.remind( "remove single document only" )
							.remind( "document count before remove document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function removeDocument( callback ){
			this.method( "edit" )
				( option, function onEditDocument( issue, data, option ){
					if( issue ){
						issue
							.remind( "document edit for remove document" )
							.pass( callback );

					}else{
						callback( );
					}
				} );
		},

		function checkDocument( callback ){
			option.query.status = REMOVED;

			this.method( "check" )
				( option, function onCheckDocument( issue, exist, option ){
					if( issue ){
						issue
							.remind( "document check for remove document" )
							.pass( callback );

					}else if( exist ){
						callback( );

					}else{
						Warning( "document does not exists", option )
							.remind( "document has not been removed" )
							.remind( "document check for remove document" )
							.pass( callback );
					}
				} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		function lastly( ){
			if( issue ){
				issue
					.remind( "failed remove document", option )
					.pass( callback, option.result, option );

			}else{
				callback( null, option.result, option );
			}
		} );

	return this;
};


/*;
	@method-documentation:
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.cacheDocument = function cacheDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	callback( null, null, option );
};

/*;
	@method-documentation:
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.revertDocument = function revertDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	callback( null, null, option );
};

/*;
	@method-documentation:
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.severeDocument = function severeDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	callback( null, null, option );
};

/*;
	@method-documentation:
	@end-method-documentation

	@option:
		{
			"query:required": "object"
		}
	@end-option
*/
Myelin.prototype.linkDocument = function linkDocument( option, callback ){
	/*;
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	callback( null, null, option );
};

optcall( Myelin );

heredito( Myelin, Dendron );

symbiote( Myelin );

harden( "Myelin", Myelin );

module.exports = Myelin;

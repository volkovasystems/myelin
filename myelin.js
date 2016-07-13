"use strict";

/*:
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2016 Richeve Siodina Bebedor
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
			"called": "called",
			"crypto": "crypto",
			"diatom": "diatom",
			"fnord": "fnord",
			"harden": "harden",
			"hashid": "hashids",
			"llamalize": "llamalize",
			"olivant": "olivant",
			"raze": "raze",
			"shardize": "shardize",
			"spalten": "spalten",
			"symbiote": "symbiote"
			"util": "util",
			"uuid": "node-uuid"
		}
	@end-include
*/

var _ = require( "lodash" );
var async = require( "async" );
var called = require( "called" );
var crypto = require( "crypto" );
var diatom = require( "diatom" );
var fnord = require( "fnord" );
var harden = require( "harden" );
var heredito = require( "heredito" );
var hashid = require( "hashids" );
var llamalize = require( "llamalize" );
var olivant = require( "olivant" );
var plough = require( "plough" );
var raze = require( "raze" );
var shardize = require( "shardize" );
var spalten = require( "spalten" );
var symbiote = require( "symbiote" );
var util = require( "util" );
var uuid = require( "node-uuid" );


harden( "ACTIVE", "active" );
harden( "DISABLED", "disabled" );
harden( "REMOVED", "removed" );

var Myelin = diatom( "Myelin" );

harden( "Myelin", Myelin );

/*:
	@method-documentation:
		Creates unique hash of the document.

		This hash represents the document and changes when the document changes.
	@end-method-documentation

	@option-configuration:
		{
			"data:required": "[*]"
		}
	@end-option-configuration
*/
harden( "createHash", function createHash( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/
	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !option.data ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create hash" );

		callback( warning, null, option );

		return null;
	}

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create hash" );

		callback( warning, null, option );

		return null;
	}

	//: Preserve the reference of the array.
	var data = [ ].concat( option.data );

	//: Hash uniqueness factor to differentiate from other models.
	if( this.difference ){
		data.push( this.difference );
	}

	var hash = crypto.createHash( "sha512" );

	hash.update( JSON.stringify( _.compact( data ) ) );

	hash = hash.digest( "hex" );

	callback( null, hash, option );

	return hash;
}, Myelin );

/*:
	@method-documentation:
		Creates unique reference of the document.

		This reference never changes even if the document changes.
	@end-method-documentation

	@option-configuration:
		{
			"data:required": "[*]"
		}
	@end-option-configuration
*/
harden( "createReference", function createReference( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/
	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !option.data ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create reference" );

		callback( warning, null, option );

		return null;
	}

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create reference" );

		callback( warning, null, option );

		return null;
	}

	//: Preserve the reference of array.
	var data = [ ].concat( option.data );

	data.push( uuid.v1( ) );

	data.push( uuid.v4( ) );

	var reference = Myelin.createHash.bind( this )( { "data": data } );

	callback( null, reference, option );

	return reference;
}, Myelin );

/*:
	@method-documentation:
		Create stamp and short code.

		Stamp code are path safe code.

		Short codes are half representation of stamp codes.
	@end-method-documentation
*/
harden( "createStamp", function createStamp( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !option.data ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create stamp" );

		callback( warning, null, option );

		return null;
	}

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create stamp" );

		callback( warning, null, option );

		return null;
	}

	var reference = Myelin.createHash.bind( this )( { "data": option.data } );

	var salt = option.salt || this.salt;

	var token = reference
		.toString( )
		.match( /\w{1,31}/g )
		.map( function onEachToken( token ){
			return parseInt( token, 16 );
		} );

	//: This will create a 12 character length stamp code.
	var stamp = new hashid( salt, 0, [
		"abcdefghijklmnopqrstuvwxyz",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0123456789"
	].join( "" ) ).encode( token );

	if( stamp.length > 12 ){
		stamp = stamp.substring( 0, 12 );

	}else{
		while( stamp.length != 12 ){
			stamp += "0";
		}
	}

	//: The number of repetition is defined by the index of the stamp.
	stamp = _.compact( [ stamp, option.index ] ).join( "-" );

	//: This will create 6 character length short code.
	var short = new hashid( salt, 0, [
		"abcdefghijklmnopqrstuvwxyz",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0123456789",
		"?!@$%#&*+=<>"
	].join( "" ) )
	.encode( reference
		.toString( )
		.match( /\w{1,63}/g )
		.map( function onEachToken( token ){
			return parseInt( token, 16 );
		} ) );

	if( short.length > 6 ){
		short = short.substring( 0, 6 );

	}else{
		while( short.length != 6 ){
			short += "0";
		}
	}

	option.short = short;

	callback( null, stamp, option );

	return stamp;
}, Myelin );

harden( "generateSalt", function generateSalt( ){
	return fnord( [
		0x0aaa, 0x0bbb, 0x0bbb, 0x0ccc, 0x0ddd,
		0x0eee, 0x0fff, 0x0fad, 0x0bad, 0x0bed,
		0x0fed, 0x0abe, 0xdead, 0xbeef, 0xdeaf,
		0xcafe, 0xfeed, 0xfade, 0xbead, 0xdeed,
		0xaaaa, 0xbbbb, 0xcccc, 0xdddd, 0xffff
	] ).join( 0x200b );
}, Myelin );

harden( "wrap", function wrap( engine, option ){
	var name = engine;
	if( typeof engine == "function" ){
		name = engine.name;
	}

	var Engine = heredito( diatom( name ), Myelin );

	Engine.prototype.name = option.name || "document";
	Engine.prototype.title = option.title || "Document";
	Engine.prototype.salt = option.salt || Myelin.generateSalt( );
	Engine.prototype.difference = option.difference || "document";
	Engine.prototype.pageSize = option.pageSize || 5;

	Engine.prototype.initialize = option.initialize ||
		function initialize( ){
			return this;
		};

	Engine = symbiote( Engine );

	if( typeof engine == "function" ){
		var engineProperty = Object.getOwnPropertyNames( engine.prototype );
		var enginePropertyLength = engineProperty.length;
		for( var index = 0; index < enginePropertyLength; index++ ){
			var property = engineProperty[ index ];

			Engine.prototype[ property ] = engine.prototype[ property ];
		}
	}

	harden( name, Engine );
	var rootEngine = Engine( {
		"model": option.model,
		"mold": option.mold
	} );
	harden( "engine", rootEngine, Engine );

	return Engine;
}, Myelin );

/*:
	@method-documentation:

	@end-method-documentation
*/
Myelin.prototype.initialize = function initialize( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	this.mold = option.mold;

	this.model = option.model;

	this.name = option.name || this.name;

	this.title = option.title || this.title;

	this.salt = option.salt || this.salt;

	this.difference = option.difference || this.difference;

	this.pageSize = option.pageSize || this.pageSize;

	return this;
};

/*:
	@method-documentation:
		Calls the method of the engine.

		If the method is not overriden, it will use the default method.
	@end-method-documentation
*/
Myelin.prototype.method = function method( action, name ){
	/*:
		@meta-configuration:
			{
				"action:required": [
					"string",
					"..."
				],
				"name:required": [
					"string",
					"..."
				]
			}
		@end-meta-configuration
	*/

	if( typeof this[ action ] == "function" ){
		return this[ action ].bind( this );
	}

	name = name || this.name;

	var parameter = _( raze( arguments )
		.concat( [ name ] )
		.map( function onEachParameter( parameter ){
			return shardize( parameter, true ).split( "-" );
		} ) )
		.flatten( )
		.compact( )
		.uniq( )
		.value( )
		.join( "-" );

	var methodName = llamalize( parameter );

	if( typeof this[ methodName ] == "function" ){
		return this[ methodName ].bind( this );

	}else if( typeof this[ methodName ] != "function" &&
		name != "document" )
	{
		Warning( "no method override for", methodName, parameter )
			.remind( "reusing parent method" )
			.prompt( );

		action = parameter.replace( "-" + name, "" );

		return this.method.bind( this )( action, "document" );

	}else{
		return called.bind( this )( );
	}
};

/*:
	@method-documentation:
		Hash is used to compare if the document is unique
			based on their uniqueness factors.

		This is changing whenever the factors are also modified.
	@end-method-documentation
*/
Myelin.prototype.createHash = function createHash( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create document hash" );

		callback( warning, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create document hash" );

		callback( warning, null, option );

		return this;
	}

	Myelin.createHash.bind( this )( option,
		function onCreateHash( issue, hash, option ){
			if( issue ){
				issue.remind( "failed creating document hash", option )

				callback( issue, null, option );

			}else{
				option.query = { "hash": hash };

				this.method( "check" )( option,
					function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "failed checking document", option )
								.remind( "cannot create document hash" );

							callback( issue, null, option );

						}else if( exist ){
							var warning = Warning( "document hash duplicate", option )
								.remind( "cannot create document hash" );

							callback( warning, null, option );

						}else{
							callback( null, hash, option );
						}
					} );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		This is a public reference for identifying the specific
			document. This reference never change.
	@end-method-documentation
*/
Myelin.prototype.createReference = function createReference( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create document reference" );

		callback( warning, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create document reference"  );

		callback( warning, null, option );

		return;
	}

	Myelin.createReference.bind( this )( option,
		function onCreateReference( issue, reference, option ){
			if( issue ){
				issue.remind( "failed creating document reference", option );

				callback( issue, null, option );

			}else{
				option.query = { "reference": reference };

				this.method( "check" )( option,
					function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "failed checking document", option )
								.remind( "cannot create document reference" );

							callback( issue, null, option );

						}else if( exist ){
							var warning = Warning( "document reference duplicate", option )
								.remind( "cannot create document reference" );

							callback( warning, null, option );

						}else{
							callback( null, reference, option );
						}
					} );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Stamp is used to reference the document on API level.

		A stamp code can be appended to the path and used as reference
			to get the document.

		Stamps changes when unique factors are modified but this will stay
			unique for every document.

		A short code will also be generated.
	@end-method-documentation
*/
Myelin.prototype.createStamp = function createStamp( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !Array.isArray( option.data ) ){
		var warning = Warning( "invalid data", option )
			.remind( "cannot create document stamp" );

		callback( warning, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot create document stamp" );

		callback( warning, null, option );

		return;
	}

	option.index = option.index || 0;

	option.data = option.data.concat( [ option.index ] );

	Myelin.createStamp.bind( this )( option,
		function onCreateStamp( issue, stamp, option ){
			if( issue ){
				issue.remind( "failed creating document stamp", option );

				callback( issue, null, option );

			}else{
				option.query = { "stamp": stamp };

				this.method( "check" )( option,
					function onCheckDocument( issue, exist, option ){
						if( issue ){
							issue
								.remind( "failed checking document", option )
								.remind( "cannot create document stamp" );

							callback( issue, null, option );

						}else if( exist ){
							Warning( "document stamp duplicate", option )
								.prompt( "reshuffling document stamp" );

							option.index++;
							option.data.pop( );
							this.method( "create", "stamp" )( option, callback );

						}else{
							//: This will try to create a code.
							option[ this.name ] = option[ this.name ] || { };

							option.code = [
								option.data.name || option[ this.name ].name || this.name,
								stamp
							].join( "-" );

							callback( null, stamp, option );
						}
					} );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Generate all three identifications.
	@end-method-documentation
*/
Myelin.prototype.generateID = function generateID( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot generate identification" );

		callback( warning, null, option );

		return engine;
	}

	option[ this.name ] = option[ this.name ] || { };

	async.waterfall( [
		function createHash( callback ){
			this.method( "create", "hash" )( option, callback );
		},

		function createReference( hash, option, callback ){
			option[ this.name ].hash = hash;

			this.method( "create", "reference" )( option, callback );
		},

		function createStamp( reference, option, callback ){
			option[ this.name ].reference = reference;

			this.method( "create", "stamp" )( option, callback );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue, stamp, optiom ){
			if( issue ){
				issue.remind( "failed generating ID", option );

				callback( issue, null, option );

			}else{
				option[ this.name ].stamp = stamp;

				callback( null, option[ this.name ], option );
			}

		} ).bind( this ) );

	return this;
};


/*:
	@method-documentation:
		Count active documents.

		Modify status to get count of disabled or removed documents.
	@end-method-documentation
*/
Myelin.prototype.countDocument = function countDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( !option.query &&
		option.reference )
	{
		option.query = {
			"reference": option.reference
		};
	}

	option.query = option.query || { };
	option.query.status = option.query.status || ACTIVE;

	this.model
		.count( option.query )
		.exec( function onExecute( error, count ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed counting document", option );

				callback( issue, null, option );

			}else{
				callback( null, count, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Get the total count of active documents.

		Modify the status to get the total count of disabled and removed documents.
	@end-method-documentation
*/
Myelin.prototype.totalDocument = function totalDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	option.query = { };
	option.query.status = option.query.status || ACTIVE;

	this.method( "count" )( option,
		function onCountDocument( issue, count, option ){
			if( issue ){
				issue.remind( "failed getting document total count", option );

				callback( issue, null, option );

			}else{
				callback( null, count, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Get the partition count of the document.

		Returns the suggested page count for the collection.
	@end-method-documentation
*/
Myelin.prototype.partitionDocument = function partitionDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	option.query = option.query || { };
	option.query.status = option.query.status || ACTIVE;

	this.method( "count" )( option,
		function onCountDocument( issue, count, option ){
			if( issue ){
				issue.remind( "failed paritioning document", option );

				callback( issue, null, option );

			}else if( count ){
				var partition = spalten( count );

				option.partition = partition;

				callback( null, partition.pageCount, option );

			}else{
				var warning = Warning( "count is zero", option )
					.remind( "cannot partition document" );

				callback( warning, null, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Check the active document existence based on the given query.

		Modify the status to check for disabled or removed documents.

		By default, it checks for single document.

		Pass a condition function to test for the count of possible documents.

		Returns true or false.
	@end-method-documentation
*/
Myelin.prototype.checkDocument = function checkDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) &&
		option.reference )
	{
		option.query = {
			"reference": option.reference
		};
	}

	option.query = option.query || { };
	option.query.status = option.query.status || ACTIVE;

	option.condition = option.condition ||
		function condition( count ){
			return count === 1;
		};

	this.method( "count" )( option,
		function onCountDocument( issue, count, option ){
			if( issue ){
				issue.remind( "failed checking document", option );

				callback( issue, null, option );

			}else{
				callback( null, option.condition( count ), option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Test if the collection or query will return any document.

		The condition is set to one or many.
	@end-method-documentation
*/
Myelin.prototype.testDocument = function testDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	option.query = option.query || { };

	option.condition = function condition( count ){
		return count > 0;
	};

	this.method( "check" )( option,
		function onCheckDocument( issue, exist, option ){
			if( issue ){
				issue.remind( "failed testing document", option );

				callback( issue, null, option );

			}else{
				callback( null, exist, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Get active document.

		Modify the status to get document based on their current status.
	@end-method-documentation
*/
Myelin.prototype.getDocument = function getDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) &&
		option.reference )
	{
		option.query = {
			"reference": option.reference
		};
	}

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot get document" );

		callback( warning, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	this.model
		.findOne( option.query )
		.exec( ( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed getting document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed getting document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Sort active document based on query with pagination.

		Modify status to sort disabled or removed documents.
	@end-method-documentation
*/
Myelin.prototype.sortDocument = function sortDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.sort ) ){
		var warning = Warning( "empty sort", option )
			.remind( "cannot sort document" );

		callback( warning, null, option );

		return this;
	}

	option.query = option.query || { };
	option.query.status = option.query.status || ACTIVE;

	var pageIndex = option.pageIndex || 0;
	var pageSize = option.pageSize || this.pageSize;

	this.model
		.find( option.query )
		.sort( option.sort )
		.skip( pageIndex * pageSize )
		.limit( pageSize )
		.exec( ( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed sorting document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) &&
				pageIndex )
			{
				Warning( "document sorted empty", option )
					.prompt( "going back to first page" );

				option.pageIndex = 0;

				this.method( "sort" )( option, callback );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "document sorted empty", option );

				callback( warning, null, option );

			}else{
				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Search active documents with pagination.

		Modify status to search disabled or removed documents.

		Note that query must be specified.
	@end-method-documentation
*/
Myelin.prototype.searchDocument = function searchDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot search document" );

		callback( warning, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	var pageIndex = option.pageIndex || 0;
	var pageSize = option.pageSize || this.pageSize;

	this.model
		.find( option.query )
		.skip( pageIndex * pageSize )
		.limit( pageSize )
		.exec( ( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed searching for document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) &&
				pageIndex )
			{
				Warning( "document searched empty", option )
					.prompt( "going back to first page" );

				option.pageIndex = 0;

				this.method( "search" )( option, callback );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "document searched empty", option );

				callback( warning, null, option );

			}else{
				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		List active document based on query with pagination.

		Modify status to list disabled or removed documents.
	@end-method-documentation
*/
Myelin.prototype.listDocument = function listDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	option.query = option.query || { };
	option.query.status = option.query.status || ACTIVE;

	var pageIndex = option.pageIndex || 0;
	var pageSize = option.pageSize || this.pageSize;

	this.model
		.find( option.query )
		.skip( pageIndex * pageSize )
		.limit( pageSize )
		.exec( ( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed getting list of document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) &&
				pageIndex )
			{
				Warning( "document listed empty", option )
					.prompt( "going back to first page" );

				option.pageIndex = 0;

				this.method( "list" )( option, callback );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "document listed empty", option );

				callback( warning, null, option );

			}else{
				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Get all document regardless of their status.
	@end-method-documentation
*/
Myelin.prototype.getAllDocument = function getAllDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	this.model
		.find( )
		.exec( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed getting all document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed getting all document" );

				callback( warning, null, option );

			}else{
				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Customisable way to get many document based on query.

		This procedure can be time consuming depending on the query.
	@end-method-documentation
*/
Myelin.prototype.queryDocument = function queryDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	option.query = option.query || { };

	this.model
		.find( option.query )
		.exec( function onExecute( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed querying document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed querying document" );

				callback( warning, null, option );

			}else{
				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Generate identification, add document and refreshes it.
	@end-method-documentation
*/
Myelin.prototype.createDocument = function createDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	async.waterfall( [
		function generateID( callback ){
			this.method( "generateID" )( option, callback );
		},

		function addDocument( data, option, callback ){
			this.method( "add" )( option, callback );
		},

		function refreshDocument( data, option, callback ){
			this.method( "refresh" )( option, callback );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue, data, option ){
			if( issue ){
				issue.remind( "failed creating document", option );

				callback( issue, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Generate identification, assume document and refreshes it.
	@end-method-documentation
*/
Myelin.prototype.touchDocument = function touchDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	async.waterfall( [
		function generateID( callback ){
			this.method( "generateID" )( option, callback );
		},

		function assumeDocument( data, option, callback ){
			this.method( "assume" )( option, callback );
		},

		function refreshDocument( data, option, callback ){
			option.query.status = DISABLED;
			
			this.method( "refresh" )( option, callback );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue, data, option ){
			if( issue ){
				issue.remind( "failed toucing document", option );

				callback( issue, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};
/*:
	@method-documentation:
		Add document in disable mode.
	@end-method-documentation
*/
Myelin.prototype.assumeDocument = function assumeDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot assume document" );

		callback( warning, null, option );

		return this;
	}

	option.data.status = DISABLED;

	this.method( "add" )( option,
		function onAddDocument( issue, data, option ){
			if( issue ){
				issue.remind( "failed assuming document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "document empty", option )
					.remind( "failed assuming document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = option[ this.name ] || { };
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Add document.
	@end-method-documentation
*/
Myelin.prototype.addDocument = function addDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot add document" );

		callback( warning, null, option );

		return this;
	}

	option.data.model = this.name;

	( new this.model( option.data ) )
		.save( ( function onSave( error, data ){
			if( error ){
				var issue = Issue( error )
					.remind( "failed adding document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed adding document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = option[ this.name ] || { };
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:

	@end-method-documentation
*/
Myelin.prototype.editDocument = function editDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot edit document" );

		callback( warning, null, option );

		return this;
	}

	async.waterfall( [
		function getDocument( callback ){
			this.method( "get" )( option, callback );
		},

		function editDocument( data, option, callback ){
			delete option.data.code;
			delete option.data.hash;
			delete option.data.model;
			delete option.data.path;
			delete option.data.reference;
			delete option.data.short;
			delete option.data.stamp;

			for( var property in data ){
				data[ property ] = option.data[ property ];
			}

			callback( null, data, option );
		},

		function saveDocument( data, option, callback ){
			data.model = this.name;

			data.save( function onSave( error, data ){
				if( error ){
					var issue = Issue( error )
						.remind( "failed saving document", option );

					callback( issue, null, option );

				}else if( _.isEmpty( data ) ){
					var warning = Warning( "empty document", option );

					callback( warning, null, option );

				}else{
					callback( null, data, option );
				}
			} );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

 		function lastly( issue, data, option ){
			if( issue ){
				issue.remind( "failed editing document", option );

				callback( issue, null, option );

			}else{
				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Update the document using mongoose update method.

		This by default supports multiple update.

		If you wish to update a single document specify strict query.

		This will refresh the document afterwards.

		Do not use the returning data references if you intended to use them.
	@end-method-documentation
*/
Myelin.prototype.updateDocument = function updateDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot update document" );

		callback( warning, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot update document" );

		callback( warning, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	delete option.data.code;
	delete option.data.hash;
	delete option.data.model;
	delete option.data.path;
	delete option.data.reference;
	delete option.data.short;
	delete option.data.stamp;

	option.data.model = this.name;

	this.model
		.update( option.query,

			{ $set: option.data },

			{ "mutli": true },

			( function onUpdateDocument( error, data ){
				if( error ){
					var issue = Issue( error )
						.remind( "failed updating document", option );

					callback( issue, null, option );

				}else if( _.isEmpty( data ) ){
					var warning = Warning( "empty document", option )
						.remind( "failed updating document" );

					callback( warning, null, option );

				}else{
					callback( null, data, option );

					this.method( "reboot" )( option );
				}
			} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Modify the document using mongoose update method.

		This by default supports multiple update.

		If you wish to update a single document specify strict query.

		Modify method is more customisable.

		Handle with care when using this method.
	@end-method-documentation
*/
Myelin.prototype.modifyDocument = function modifyDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot modify document" );

		callback( warning, null, option );

		return this;
	}

	if( _.isEmpty( option.data ) ){
		var warning = Warning( "empty data", option )
			.remind( "cannot modify document" );

		callback( warning, null, option );

		return this;
	}

	option.query.status = option.query.status || ACTIVE;

	this.model
		.update( option.query, option.data,

			{ "mutli": true },

			( function onModifyDocument( error, data ){
				if( error ){
					var issue = Issue( error )
						.remind( "failed modifying document", option );

					callback( issue, null, option );

				}else if( _.isEmpty( data ) ){
					var warning = Warning( "empty document", option )
						.remind( "failed modifying document" );

					callback( warning, null, option );

				}else{
					callback( null, data, option );

					this.method( "reboot" )( option );
				}
			} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Refreshes multiple documents

		Pass an option safe to drop the rebooting of documents if errors occured.
	@end-method-documentation
*/
Myelin.prototype.rebootDocument = function rebootDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	async.waterfall( [
		function getDocument( callback ){
			this.method( "query" )( option, callback );
		},

		function saveDocument( data, option, callback ){
			if( _.isEmpty( data ) ){
				callback( null, null, option );

				return;
			}

			async.parallel( plough( data )
				.map( function onEachData( _data ){
					return function saveData( callback ){
						_data.save( function onSave( error ){
							if( error ){
								var issue = Issue( error )
									.remind( "failed saving document", option )

								if( option.safe ){
									callback( issue );

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
						issue.remind( "failed saving reboot document", option );

						callback( issue );

					}else{
						callback( null, data, option );
					}
				} );
		},

		function getDocument( data, option ){
			this.method( "query" )( option, callback );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

		( function lastly( issue, data, option ){
			if( issue ){
				issue.remind( "failed rebooting document", option );

				callback( issue, null, option );

			}else{
				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Refresh the document by re-saving it which in turn
			activates all database middleware hooks.
	@end-method-documentation
*/
Myelin.prototype.refreshDocument = function refreshDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	async.waterfall( [
		function getDocument( callback ){
			this.method( "get" )( option, callback );
		},

		function saveDocument( data, option, callback ){
			data.save( function onSave( error, data ){
				if( error ){
					var issue = Issue( error )
						.remind( "failed saving document", option );

					callback( issue, null, option );

				}else if( _.isEmpty( data ) ){
					var warning = Warning( "empty document", option )
						.remind( "failed refreshing document" );

					callback( warning, null, option );

				}else{
					callback( null, data, option );
				}
			} );
		},

		function getDocument( data, option ){
			this.method( "get" )( option, callback );
		}

		].map( ( function onEachProcedure( procedure ){
			return procedure.bind( this );
		} ).bind( this ) ),

 		( function lastly( issue, data, option ){
			if( issue ){
				issue.remind( "failed refreshing document", option );

				callback( issue, null, option );

			}else{
				option[ this.name ] = option[ this.name ] || { };
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} ).bind( this ) );

	return this;
};

/*:
	@method-documentation:
		Marks the document disabled.
	@end-method-documentation
*/
Myelin.prototype.disableDocument = function disableDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot disable document" );

		callback( warning, null, option );

		return this;
	}

	//: Disable only active documents.
	option.query.status = ACTIVE;

	option.data = option.data || { };
	option.data.status = option.data.status || DISABLED;

	this.method( "update" )
		( option, function onUpdateDocument( issue, data, option ){
			if( issue ){
				issue.remind( "failed disabling document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed disabling document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Activates a disabled document.
	@end-method-documentation
*/
Myelin.prototype.resumeDocument = function resumeDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot resume document" );

		callback( warning, null, option );

		return this;
	}

	//: Resume only disabled documents.
	option.query.status = DISABLED;

	option.data = option.data || { };
	option.data.status = option.data.status || ACTIVE;

	this.method( "update" )
		( option, function onResumeDocument( issue, data, option ){
			if( issue ){
				issue.remind( "failed resuming document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed resuming document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} );

	return this;
};

/*:
	@method-documentation:
		Marks the document for removal.

		By default this will mark active documents,
			to mark disabled documents specify the status in the query.
	@end-method-documentation
*/
Myelin.prototype.removeDocument = function removeDocument( option, callback ){
	/*:
		@meta-configuration:
			{
				"option:required": "object",
				"callback:required": "function"
			}
		@end-meta-configuration
	*/

	option = option || { };

	option.self = option.self || this;

	callback = called.bind( option.self )( callback );

	if( _.isEmpty( option.query ) ){
		var warning = Warning( "empty query", option )
			.remind( "cannot remove document" );

		callback( warning, null, option );

		return this;
	}

	option.data = option.data || { };
	option.data.status = option.data.status || REMOVED;

	this.method( "update" )
		( option, function onRemoveDocument( issue, data, option ){
			if( issue ){
				issue.remind( "failed removing document", option );

				callback( issue, null, option );

			}else if( _.isEmpty( data ) ){
				var warning = Warning( "empty document", option )
					.remind( "failed removing document" );

				callback( warning, null, option );

			}else{
				option[ this.name ] = data;

				callback( null, data, option );
			}
		} );

	return this;
};


module.exports = Myelin;

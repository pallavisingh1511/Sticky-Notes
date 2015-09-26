var db = null;

//Create Databse
if(window.openDatabase){
    db = openDatabase("NoteTest", "1.0", "Sticky Database", 10000000);
    if(!db)
        alert("Failed to open database");
} else{
    alert("Failed to open database, make sure your browser supports HTML5 web storage");
}

var capture = null;
var highestZ = 0;
var highestIc = 0;

//Note Object
function Note(){
    var self = this;
    
    //Note
    var note = document.createElement('div');
    note.className = 'note';
    note.addEventListener('mousedown',function(e){
        return self.onMouseDown(e);    
    }, false);
     note.addEventListener('click', function(){
        return self.onNoteClick()
     }, false);        
    this.note = note;
    
    //Close
    var close = document.createElement('div');
    close.className = 'closebutton';    
    close.addEventListener('click',function(e){
        return self.close(e);
    }, false);    
    note.appendChild(close);
    
    //Edit
    var edit = document.createElement('div');
    edit.className = 'edit';
    edit.setAttribute('contenteditable', false);
    edit.addEventListener('keyup',function(){
        return self.OnKeyUp();
    }, false);    
    note.appendChild(edit);
    this.editField = edit;
    
    //Timestamp
    var ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.addEventListener('mousedown',function(e){
        return self.OnMouseDown(e);
    }, false);    
    note.appendChild(ts);
    this.lastModified = ts;
    
    document.body.appendChild(note);
    return this;
}

//Functions and properties to be extending the Note object (getters & setters)
Note.prototype = {
    
    //Id getter & setter
    get id(){
        if(!("_id" in this)){
            this._id = 0;
            return this._id;
        }
    },
       
    set id(x){
        this._id = x;
    },  

    //Text getter & setter
    get text(){
        return this.editField.innerHTML;
    },
     
    set text(x){
        this.editField.innerHTML = x;
    },   

    //Timestamp getter & setter
    get timestamp(){
        if(!("_timestamp" in this)){
            this._timestamp = 0;
            return this._timestamp;
        }
    },
    
    set timestamp(x){
        if(this._timestamp == x){
            return;
        }
        this._timestamp = x;
        var date = new Date();
        date.setTime(parseFloat(x));
        this.lastModified.textContent = modifiedString(date);
    },   
    
    //Position getter & setter (left, top)
    get left(){
        return this.note.style.left;
    },
     
    set left(x){
        this.note.style.left = x;
    },   
    
    get top(){
        return this.note.style.top;
    },
     
    set top(x){
        this.note.style.top = x;
    }, 
    
    //zIndex getter & setter
    get zIndex(){
        return this.note.style.zIndex;
    },
     
    set zIndex(x){
        this.note.style.zIndex = x;
    }, 
    
    close: function(e){
        this.cancelPendingSave();
        var note = this;
        db.transaction(function(tx){
            tx.executeSql("DELETE FROM MySticky WHERE id = ?", [note.id]);
        });
        document.body.removeChild(this.note);
    },
    
    saveSoon: function(){
        this.cancelPendingSave();
    var self = this;
    this._saveTimer = setTimeout(function(){
            self.save();
        }, 200);
    },
    
    cancelPendingSave: function(){
        if(!("_saveTimer" in this)){
            return;
        }
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    },
    
    //Save an already existing sticky
    save: function(){
        this.cancelPendingSave();
        if("dirty" in this){
            this.timestamp = new Date().getTime();
            delete this.dirty;
        }
        
        var note this;
        db.transaction(function(tx){
            tx.executeSql("UPDATE MySticky SET note = ?, timestamp = ?, left = ?, top = ? , zindex = ? WHERE id = ?",
                         [note.text, note.timestamp, note.left, note.top, note.zIndex, note.id]);
        
        });
    },
    
    //Saving a new sticky
    saveAsNew: function(){
        this.timestamp = new Date.getTime();
    
        var note = this;
        db.transaction(function(tx){
        tx.executeSql("INSERT INTO MySticky SET (id, note, timestamp, left, top, zindex) VALUES (?, ?, ?, ?, ?)",
                             [note.id, note.text, note.timestamp, note.left, note.top, note.zIndex]);

        });
    },
    
    // On the click of mouse button
    onMouseDown: function(e){
        capture = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;
        
        var self = this;
        if(!("mouseMoveHandler" in this)){
            this.mouseMoveHandler = function(e){return self.onMouseMove(e)}
            this.mouseUpHandler = function(e){return self.onMouseUp(e)}
        }
        //Create evenetlisteners
        document.addEventListener("mousemove", this.mouseMoveHandler, true);
        document.addEventListener("mouseup", this.mouseUpHandler, true);
    },

    // On the drag of mouse  
     onMouseMove: function(e){
        if(this != captured){
            return true;
        }
         this.left = e.clientX - this.startX + 'px';
         this.top = e.clientY - this.startY + 'px';
         return false;
     },

    // On the release of mouse button
     onMouseUp: function(e){

         document.removeEventListener("mousemove", this.mouseOverHandler, true);
         document.removeEventListener("mouseup", this.mouseUpHandler, true);

         this.save();
         return false;
     },

    //On click of node
    onNoteClick: function(e){
        this.editField.focus();
        getSelection().collapseToEnd();
     },
    
    // On the release of key
     onKeyUp: function(e){
        this.dirty = true;
         this.saveSoon();
         
     }
    
}
import json
import os
from datetime import datetime
import uuid

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

class MockCollection:
    def __init__(self, name):
        self.name = name
        self.file_path = os.path.join(DATA_DIR, f"{name}.json")
        self.data = self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            with open(self.file_path, 'r') as f:
                return json.load(f)
        return {}

    def _save(self):
        with open(self.file_path, 'w') as f:
            json.dump(self.data, f, indent=2)

    def document(self, doc_id=None):
        if doc_id is None:
            doc_id = str(uuid.uuid4())
        return MockDocument(self, doc_id)

    def add(self, data):
        doc_id = str(uuid.uuid4())
        self.data[doc_id] = data
        self._save()
        return MockDocument(self, doc_id)

    def stream(self):
        for doc_id, data in self.data.items():
            yield MockDocSnapshot(doc_id, data)

    def limit(self, n):
        items = list(self.data.items())[:n]
        return MockQuery(items)

    def where(self, field, op, value):
        items = []
        for doc_id, data in self.data.items():
            if field in data:
                if op == '==' and data[field] == value:
                    items.append((doc_id, data))
        return MockQuery(items)

    def order_by(self, field, direction=None):
        items = list(self.data.items())
        reverse = direction is not None and 'DESCENDING' in str(direction)
        try:
            items.sort(key=lambda x: x[1].get(field, ''), reverse=reverse)
        except:
            pass
        return MockQuery(items)

class MockQuery:
    def __init__(self, items):
        self.items = items

    def limit(self, n):
        return MockQuery(self.items[:n])

    def stream(self):
        for doc_id, data in self.items:
            yield MockDocSnapshot(doc_id, data)

class MockDocSnapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self._data = data

    def to_dict(self):
        return self._data

    @property
    def exists(self):
        return self._data is not None

class MockDocument:
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.doc_id = doc_id

    def get(self):
        data = self.collection.data.get(self.doc_id)
        return MockDocSnapshot(self.doc_id, data)

    def set(self, data):
        self.collection.data[self.doc_id] = data
        self.collection._save()

    def update(self, data):
        if self.doc_id in self.collection.data:
            self.collection.data[self.doc_id].update(data)
            self.collection._save()

    def delete(self):
        if self.doc_id in self.collection.data:
            del self.collection.data[self.doc_id]
            self.collection._save()

class MockFirestore:
    def collection(self, name):
        return MockCollection(name)

    def document(self, path):
        parts = path.split('/')
        col = MockCollection(parts[0])
        return col.document(parts[1])

def get_db():
    return MockFirestore()


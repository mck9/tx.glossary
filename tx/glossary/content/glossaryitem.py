"""Definition of the GlossaryItem content type
"""

from zope.interface import implements, directlyProvides

from Products.Archetypes import atapi
from Products.ATContentTypes.content import document
from Products.ATContentTypes.content import schemata

from tx.glossary import txMessageFactory as _
from tx.glossary.interfaces import IGlossaryItem
from tx.glossary.config import PROJECTNAME

GlossaryItemSchema = document.ATDocumentSchema.copy() + atapi.Schema((

    # -*- Your Archetypes field definitions here ... -*-

))

# Set storage on fields copied from ATContentTypeSchema, making sure
# they work well with the python bridge properties.

GlossaryItemSchema['title'].storage = atapi.AnnotationStorage()
GlossaryItemSchema['description'].storage = atapi.AnnotationStorage()

schemata.finalizeATCTSchema(
    GlossaryItemSchema, 
    folderish=False,
    moveDiscussion=False
)

class GlossaryItem(document.ATDocument):
    """A Glossary entry"""
    implements(IGlossaryItem)

    meta_type = "GlossaryItem"
    schema = GlossaryItemSchema

    title = atapi.ATFieldProperty('title')
    description = atapi.ATFieldProperty('description')
    
    # -*- Your ATSchema to Python Property Bridges Here ... -*-

atapi.registerType(GlossaryItem, PROJECTNAME)

from django import template

register = template.Library()


@register.inclusion_tag("index.html")
def load_s3():
    return {}


@register.inclusion_tag("header.html")
def load_s3_header():
    return {}

